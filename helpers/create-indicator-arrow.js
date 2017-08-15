const THREE = require('three');

const DISPLAY_COLOR = 0x88A7D4;
// These control the look of the arrow. HALF_HEIGHT is in THREE.js units,
// and NUM_STRAIGHT_PTS and NUM_DIAGONAL_PTS will control the resolution of the
// arrow. The ratio of straight to diagonal pts will also control the look of where
// the start of the diagonal is
const ARROW_HALF_HEIGHT = 3;
const NUM_STRAIGHT_PTS = 20;
const NUM_DIAGONAL_PTS = 5;

// Parameters for the morphing of the arrow.
const NUM_MORPH_STEPS = 5;
const morphDecimal = 1 / NUM_MORPH_STEPS;

/**
 * Create an indicator arrow to mapped onto an ellipsoid. Arrow is created by pushing custom points
 * and faces into a THREE.js geometry in the following pattern
 *
 *                7
 *                |\
 *                | \9
 *                |  \
 *  1------3------5   \11
 *  |                  \
 *  |                   \12
 *  |                   /
 *  |                  /
 *  0------2------4   /10
 *                |  /
 *                | /8
 *                |/
 *                6
 *
 * where faces are pushed 0-1-2, 1-2-3, ..., 10-11-12. Although this doesn't follow proper right hand
 * rule convention, this is overcome by using THREE.DoubleSide for the material.
 *
 * It also sets morph targets for the arrow, and attaches a function to the returned mesh `setAngle`
 * which when called will let you set a new angle for the arrow to start at. This is performant and
 * can be called every render cycle to animate the arrow shrinking, for example.
 *  
 * @param  {THREE.Scene}  scene       The THREE.js scene
 * @param  {Array}        abc         The a,b,c parameters for the ellipsoid
 * @param  {Number}       startAngle  The starting angle in radians, if horizontal this
 *                                    is a theta angle, if vertical it is a phi angle
 * @param  {Number}       endAngle    The starting angle in radians, if horizontal this
 *                                    is a theta angle, if vertical it is a phi angle
 * @param  {Number}       offsetAngle The offset angle on the ellipsoid, in radians. If horizontal
 *                                    this is phi, if vertical this is theta
 * @param  {Boolean}      isVertical  Is the arrow a vertical or horizontal arrow
 * @return {THREE.Mesh}               The THREE.js mesh for the arrow
 */
function createIndicatorArrow(scene, abc, startAngle, endAngle, offsetAngle, isVertical) {
    // Create the delta of the angle, based on the total number of points in the arrow
    const dAngle = (endAngle - startAngle) / (NUM_STRAIGHT_PTS + NUM_DIAGONAL_PTS - 2);

    // Create the geometry
    const geo = new THREE.Geometry();
    const morphVerticeArrays = Array(...Array(NUM_MORPH_STEPS)).map(() => []);

    // Iterate through the number of points in the straight segment
    for(let i = 0; i < NUM_STRAIGHT_PTS; i++) {
        // Compute the angle based on the iteration
        const angle = startAngle + (dAngle * i);

        // Set theta and phi based on whether or not the angle is horizontal or vertical
        const theta = isVertical ? offsetAngle : angle;
        const phi =   isVertical ? angle : offsetAngle;
        const heightOffset = ARROW_HALF_HEIGHT / 2;

        // Push two vertices (for top and bottom of the arrow)
        geo.vertices.push(arrowVector3(abc, theta, phi, -heightOffset, isVertical));
        geo.vertices.push(arrowVector3(abc, theta, phi, heightOffset, isVertical));

        // Add to each of the the morph target arrays
        morphVerticeArrays.forEach((arr, idx) => {
            const [mTheta, mPhi] = getMorphedAngles(angle, idx);

            arr.push(arrowVector3(abc, mTheta, mPhi, -heightOffset, isVertical));
            arr.push(arrowVector3(abc, mTheta, mPhi, heightOffset, isVertical));
        });
    }

    for(let i = 0; i < NUM_DIAGONAL_PTS; i++) {
        // Compute the angle based on the iteration
        const angle = startAngle + (dAngle * (NUM_STRAIGHT_PTS-1)) + (dAngle * i);
        // Compute the change in arrow angle height based on the iteration
        const dHeight = (ARROW_HALF_HEIGHT / (NUM_DIAGONAL_PTS - 1));

        // Set theta and phi based on whether or not the angle is horizontal or vertical
        const theta = isVertical ? offsetAngle : angle;
        const phi =   isVertical ? angle : offsetAngle;
        const heightOffset = ARROW_HALF_HEIGHT - (i * dHeight);

        // Push two vertices (for top and bottom of the arrow)
        // Note that the last vertice is not pushed at the top, because at that point it is the tip,
        // and the top and bottom vertices will be the same
        geo.vertices.push(arrowVector3(abc, theta, phi, -heightOffset, isVertical));
        if(i !== (NUM_DIAGONAL_PTS - 1)) {
            geo.vertices.push(arrowVector3(abc, theta, phi, heightOffset, isVertical));
        }

        // Add to each of the the morph target arrays
        morphVerticeArrays.forEach((arr, idx) => {
            const [mTheta, mPhi] = getMorphedAngles(angle, idx);

            arr.push(arrowVector3(abc, mTheta, mPhi, -heightOffset, isVertical));
            if(i !== (NUM_DIAGONAL_PTS - 1)) {
                arr.push(arrowVector3(abc, mTheta, mPhi, heightOffset, isVertical));
            }
        });
    }

    // Push all the faces corresponding to the vertices. For simplicity, this doesn't take into account
    // right hand rule, and therefore relies on using THREE.DoubleSide for the material
    for(let i = 0; i < geo.vertices.length - 2; i++) {
        geo.faces.push(new THREE.Face3(i, i+1, i+2));
    }

    // Set the morph targets from the computed morph target arrays
    geo.morphTargets = morphVerticeArrays.map((arr, idx) => ({ name: `target${idx}`, vertices: arr }));

    // Compute vertex normals
    geo.computeVertexNormals();
    const material = new THREE.MeshBasicMaterial({
        color:        DISPLAY_COLOR,
        side:         THREE.DoubleSide,
        morphTargets: true,
    });
    const arrow = new THREE.Mesh(geo, material);

    /**
     * Set the starting angle of the arrow. A lot of the inspiration for this (and the interpolating
     * function) was taken from the r69 THREE.MorphAnimation class. I couldn't find anything that would
     * suit our needs in the current revision.
     * https://github.com/mrdoob/three.js/blob/r69/src/extras/animation/MorphAnimation.js
     * @param {Number} angle The angle (between the original starting and ending angles) to set the arrow to
     */
    arrow.setAngle = function(angle) {
        // If the angle isn't between the original angles don't do anything
        if(!isBetween(angle, startAngle, endAngle)) return;

        // Create a new array of influences set to 0
        const newInfluences = Array(...Array(NUM_MORPH_STEPS)).map(() => 0);

        // Get the absolute decimal that the angle is relative to the starting and ending decimals
        // Then use that to get the index for the current morph target and the decimal amount for the
        // current morph target
        const angleDecimal = Math.abs(angle / (endAngle - startAngle));
        const morphTargetIdx = angle === endAngle ?
            NUM_MORPH_STEPS - 1 :
            Math.floor(angleDecimal / morphDecimal);
        const morphTargetValue = (angleDecimal % morphDecimal) / morphDecimal;

        // If it's still the first morph target, just use the raw decimal, otherwise it will be a
        // combined fraction of the current morph target and the previous one
        if(morphTargetIdx === 0) {
            newInfluences[0] = morphTargetValue;
        } else {
            newInfluences[morphTargetIdx] = morphTargetValue;
            newInfluences[morphTargetIdx - 1] = 1 - morphTargetValue;
        }

        // Set the new influences
        this.morphTargetInfluences = newInfluences;
    }

    scene.add(arrow);
    return arrow;

    /**
     * Get the morphed angles based on the current angle and index of the morph target array
     * @param  {Number} angle The angle for the original point
     * @param  {Number} index The index of the morph target array
     * @return {Array}        The morphed theta and phi values
     */
    function getMorphedAngles(angle, index) {
        const morphedAngle = angle + (endAngle - angle) * ((index + 1) / NUM_MORPH_STEPS);

        const morphedTheta = isVertical ? offsetAngle  : morphedAngle;
        const morphedPhi =   isVertical ? morphedAngle : offsetAngle;

        return [morphedTheta, morphedPhi];
    }
}

/**
 * Return a THREE.Vector3 corresponding to the point transformed based on the angles and the necessary
 * height offset for the arrow, as well as whether it is vertical or not.
 * @param  {Array}         a, b, c      The semi-principal axes of the ellipsoid
 * @param  {Number}        theta        The theta value, in radians
 * @param  {Number}        phi          The phi value, in radians
 * @param  {Number}        heightOffset The height offset for the arrow (varying because of the point)
 * @param  {Boolean}       isVertical   Whether the arrow is vertical or horizontal. This will change how the
 *                                      height offset is applied to the spherical coordinate
 * @return {THREE.Vector3}              The Vector3 to be pushed as a vertice of the geometry
 */
function arrowVector3([a, b, c], theta, phi, heightOffset, isVertical) {
    if(isVertical) {
        return new THREE.Vector3(
            (b * Math.sin(phi) * Math.sin(theta)) + (-heightOffset * Math.cos(theta)), // THREE.js x maps to mathematical y
            (c * Math.cos(phi)),                                                       // THREE.js y maps to mathematical z
            (a * Math.sin(phi) * Math.cos(theta)) + (heightOffset * Math.sin(theta)),  // THREE.js z maps to mathematical x
        );
    } else {
        return new THREE.Vector3(
            (b * Math.sin(phi) * Math.sin(theta)) + (-heightOffset * Math.cos(phi)), // THREE.js x maps to mathematical y
            (c * Math.cos(phi))                   + (heightOffset * Math.sin(phi)),  // THREE.js y maps to mathematical z
            (a * Math.sin(phi) * Math.cos(theta)) + (-heightOffset * Math.cos(phi)), // THREE.js z maps to mathematical x
        );
    }
}

/**
 * Returns a boolean if the number is between the two bounds
 * @param  {Number}  num   The number to check
 * @param  {Number}  start The starting bound
 * @param  {Number}  end   The ending bound
 * @return {Boolean}       Whether or not the number is between the two bounds
 */
function isBetween(num, start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    return num > min && num < max;
}

module.exports = createIndicatorArrow;
import {
    AMPLIFIER_TYPES, COMPONENT_TYPES, IMPEDANCE_COMPONENT_TYPES,
    INDEPENDENT_CURRENT_SOURCE_TYPES, INDEPENDENT_VOLTAGE_SOURCE_TYPES
} from "../components.js";
import CommonAnalysis from "./common_analysis.js";

export default class MeshAnalysis extends CommonAnalysis {

    getLoopCurrentsToLoopVoltagesMatrix(allLoops, noCurrentsLoops) {
        const impedanceEdges = this.graph.getEdgesOfTypes(IMPEDANCE_COMPONENT_TYPES);

        // Matrix mapping loop currents to impedance component currents
        const compMatrix = impedanceEdges.map((edgeId) => {
            return CommonAnalysis.getComponentDirections(allLoops, edgeId);
        });

        // Matrix mapping impedance component currents to loop voltages (with no current sources)
        const voltMatrix = noCurrentsLoops.map((loop) => {
            return super.getGroupImpedances(loop, impedanceEdges, this.operations.multiply);
        });

        // Matrix mapping loop currents to loop voltages of impedances
        return this.matrixUtils.multiply(this.operations, voltMatrix, compMatrix);
    }

    getVoltageMetersToLoopVoltagesMatrix(noCurrentsLoops) {
        const voltageMeterEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.VOLTAGE_METER]);

        // Meter voltages -> Loop voltages with only voltage meters
        const voltageMeterMatrix = noCurrentsLoops.map((loop) => {
            return CommonAnalysis.getGroupDirections(loop, voltageMeterEdges);
        });

        const indexes = {};
        voltageMeterEdges.forEach((edgeId, index) => {
            indexes[edgeId] = index;
        });

        // Meter voltages -> Loop voltages with only voltage - voltage amplifiers
        const vcvsEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE]);
        noCurrentsLoops.forEach((loop, loopIndex) => {
            const meterCoeffs = super.getGroupMultipliers(loop, vcvsEdges);
            for (const edgeId of Object.keys(meterCoeffs)) {
                voltageMeterMatrix[loopIndex][indexes[edgeId]] += meterCoeffs[edgeId];
            }
        });

        return voltageMeterMatrix;
    }

    getCurrentMetersToLoopVoltagesMatrix(noCurrentsLoops) {
        const ccvsEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.CURRENT_CONTROLLED_VOLTAGE_SOURCE]);
        const cccsEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE]);
        const currentMeterEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.CURRENT_METER]);

        return noCurrentsLoops.map((loop) => {
            // Meter currents -> Loop voltages with only current - voltage amplifiers
            const meterCoeffs = super.getGroupMultipliers(loop, ccvsEdges);

            for (const edgeId of cccsEdges) {
                meterCoeffs[this.graph.edges[edgeId].info.meter] = 0;
            }
            return currentMeterEdges.map((edgeId) => meterCoeffs[edgeId]);
        });
    }

    getVoltageVector(loops) {
        const voltageEdges = this.graph.getEdgesOfTypes(INDEPENDENT_VOLTAGE_SOURCE_TYPES);
        return loops.map((loop) => -super.getGroupTotal(loop, voltageEdges));
    }

    /**
     * Get current source equations
     * @param {Object<string, number>[]} loops - Independent loops
     * @param {number} meterCount - Number of voltage and current meters
     * @returns {{matrix: Array<Array<any>>, vector: number[]}} - Current source matrix and vector
     */
    getCurrentSourcesEquations(loops, meterCount) {

        // Independent current sources
        const currentEdges = this.graph.getEdgesOfTypes(INDEPENDENT_CURRENT_SOURCE_TYPES);
        const currentSourcesMatrix = currentEdges.map((edgeId) => {
            return [
                ...CommonAnalysis.getComponentDirections(loops, edgeId),
                ...new Array(meterCount).fill(0)
            ];
        });

        // Constant branch currents for independent current sources
        const targetCurrents = currentEdges.map((edgeId) => -this.graph.edges[edgeId].info.value);
        return {matrix: currentSourcesMatrix, vector: targetCurrents};
    }

    getCurrentMetersMatrix(loops, voltageMeterCount, currentMeterCount) {
        const currentMeterEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.CURRENT_METER]);

        // Loop currents + Branch current of current meter = 0
        return currentMeterEdges.map((edgeId, index) => {
            const identity = new Array(currentMeterCount).fill(0);
            identity[index] = -1;
            return [
                ...CommonAnalysis.getComponentDirections(loops, edgeId),
                ...new Array(voltageMeterCount).fill(0),
                ...identity
            ];
        });
    }

    /**
     * Get VCCS matrix equations
     * @param {Object<string, number>[]} loops - Independent loops
     * @param {number} voltageMeterCount - Number of voltage meters
     * @param {number} currentMeterCount - Number of current meters
     * @returns {Array<Array<any>>} - VCCS matrix
     */
    getVCCSMatrix(loops, voltageMeterCount, currentMeterCount) {
        const voltageMeterEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.VOLTAGE_METER]);

        // Voltage - Current amplifier
        const vccsEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.VOLTAGE_CONTROLLED_CURRENT_SOURCE]);
        const vccsMatrix = [];

        const voltageMeterIndexes = {};
        voltageMeterEdges.forEach((edgeId, index) => {
            voltageMeterIndexes[edgeId] = index;
        });

        vccsEdges.forEach((edgeId) => {
            const edge = this.graph.edges[edgeId];
            const identity = new Array(voltageMeterCount).fill(0);
            identity[voltageMeterIndexes[edge.info.meter]] = edge.info.value;
            vccsMatrix.push([
                ...CommonAnalysis.getComponentDirections(loops, edgeId),
                ...identity,
                ...new Array(currentMeterCount).fill(0)
            ]);
            vccsMatrix.push([
                ...CommonAnalysis.getComponentDirections(loops, edge.info.meter),
                ...new Array(voltageMeterCount + currentMeterCount).fill(0)
            ]);
        });
        return vccsMatrix;
    }

    getCCCSMatrix(loops, voltageMeterCount, currentMeterCount) {
        const currentMeterEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.CURRENT_METER]);

        const currentMeterIndexes = {};
        currentMeterEdges.forEach((edgeId, index) => {
            currentMeterIndexes[edgeId] = index;
        });

        // Current - Current amplifier
        const cccsEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE]);
        return cccsEdges.map((edgeId) => {
            const edge = this.graph.edges[edgeId];
            const identity = new Array(currentMeterCount).fill(0);
            identity[currentMeterIndexes[edge.info.meter]] = edge.info.value;
            return [
                ...CommonAnalysis.getComponentDirections(loops, edgeId),
                ...new Array(voltageMeterCount).fill(0),
                ...identity
            ];
        });
    }

    getVCVSMatrix(allLoops, meterCount) {
        // Voltage - Voltage amplifier
        const vcvsEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE]);
        return vcvsEdges.map((edgeId) => {
            return [
                ...CommonAnalysis.getComponentDirections(allLoops, this.graph.edges[edgeId].info.meter),
                ...new Array(meterCount).fill(0)
            ];
        });
    }

    getComponentCurrentsFromLoopCurrents(allLoops, loopCurrentsArray) {
        const noCurrentEdges = this.graph.getEdgesOfTypes([
            ...IMPEDANCE_COMPONENT_TYPES,
            ...AMPLIFIER_TYPES,
            COMPONENT_TYPES.VOLTAGE_METER,
            COMPONENT_TYPES.INDEPENDENT_VOLTAGE_SOURCE_TYPES
        ]);

        // Matrix mapping loop currents to impedance component currents
        const compMatrix = noCurrentEdges.map((edgeId) => {
            return CommonAnalysis.getComponentDirections(allLoops, edgeId);
        });

        const loopCurrentsColumn = this.matrixUtils.transpose([loopCurrentsArray]);
        const componentCurrentsMatrix = this.matrixUtils.multiply(this.operations, compMatrix, loopCurrentsColumn);
        const [currentList] = this.matrixUtils.transpose(componentCurrentsMatrix);

        const currents = {};
        noCurrentEdges.forEach((edgeId, index) => {
            currents[edgeId] = currentList[index];
        });

        return currents;
    }

    getSolution(graphAlgorithms) {

        // Find an independent set of loops
        const allLoops = graphAlgorithms.findFundamentalCycleBasis(this.graph);

        // Find an independent set of loops with no current sources
        const noCurrentsGraph = this.graph.excludeEdgesOfTypes([
            ...INDEPENDENT_CURRENT_SOURCE_TYPES,
            COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE,
            COMPONENT_TYPES.VOLTAGE_CONTROLLED_CURRENT_SOURCE
        ]);
        const noCurrentsLoops = graphAlgorithms.findFundamentalCycleBasis(noCurrentsGraph);

        // Matrix mapping loop currents and voltage/current meters to loop voltages
        const loopVoltagesMatrix = this.matrixUtils.concatMultiple([
            this.getLoopCurrentsToLoopVoltagesMatrix(allLoops, noCurrentsLoops),
            this.getVoltageMetersToLoopVoltagesMatrix(noCurrentsLoops),
            this.getCurrentMetersToLoopVoltagesMatrix(noCurrentsLoops)
        ]);
        const targetVoltages = this.getVoltageVector(noCurrentsLoops);

        const voltageMeterEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.VOLTAGE_METER]);
        const currentMeterEdges = this.graph.getEdgesOfTypes([COMPONENT_TYPES.CURRENT_METER]);

        const voltageMeterCount = voltageMeterEdges.length;
        const currentMeterCount = currentMeterEdges.length;
        const meterCount = voltageMeterCount + currentMeterCount;

        const {
            matrix: currentSourcesMatrix,
            vector: targetCurrents
        } = this.getCurrentSourcesEquations(allLoops, meterCount);
        const currentMeterMatrix = this.getCurrentMetersMatrix(allLoops, voltageMeterCount, currentMeterCount);
        const vccsMatrix = this.getVCCSMatrix(allLoops, voltageMeterCount, currentMeterCount);
        const cccsMatrix = this.getCCCSMatrix(allLoops, voltageMeterCount, currentMeterCount);
        const vcvsMatrix = this.getVCVSMatrix(allLoops, meterCount);

        // Matrix equation
        const matrix = [
            loopVoltagesMatrix, currentSourcesMatrix, vccsMatrix,
            currentMeterMatrix, vcvsMatrix, cccsMatrix
        ].flat();

        const target = [
            targetVoltages, targetCurrents,
            new Array(vccsMatrix.length + currentMeterMatrix.length + vcvsMatrix.length + cccsMatrix.length).fill(0)
        ].flat();

        const {unknowns, meterVoltages, meterCurrents} = super.solve(matrix, target, voltageMeterEdges, currentMeterEdges, allLoops.length);

        return {
            currents: this.getComponentCurrentsFromLoopCurrents(allLoops, unknowns),
            meterVoltages,
            meterCurrents
        };
    }
}

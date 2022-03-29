import { Transform } from "assemblyscript/transform";
import { Program } from "assemblyscript";
import * as path from "path";
import process from "process"
import * as preprocess from "eosio-asc/src/preprocess/index";
import { getContractInfo } from "eosio-asc/src/contract/contract";

export class ContractTransform extends Transform {
    constructor(public abiEditor: any) {
        super()
    }

    afterInitialize(program: Program): void {
        let source = program.sources[0];
        // TODO: make sure the semantics
        for (const src of program.sources) {
            if (
                src.sourceKind === 1 &&
                src.simplePath !== "index-incremental"
            ) {
                source = src;
                break;
            }
        }
        const info = getContractInfo(program);
        const internalPath = info.contract.classPrototype.internalName.split('/')
        const internalFolder = internalPath.slice(0, internalPath.length - 2)
        const internalFile = internalPath[internalPath.length - 2]

        const abi = preprocess.getAbiInfo(info);
        const out = preprocess.getExtCodeInfo(info);

        const baseDir = path.join(...internalFolder, "target");
        out.entryDir = baseDir;
        process.sourceModifier = out;
        const abiPath = path.join(internalFolder.map((_: any) => '..').join(path.sep), '..', baseDir, `${internalFile}.abi`);
        console.log("++++++writeFile:", abiPath);
        this.abiEditor.setValue(abi)
        // this.writeFile(abiPath, abi, baseDir);
    }
}

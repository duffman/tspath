import {TSPath} from './src/tspath';

process.argv.slice(2);
console.log(process.argv);
process.exit();

const TsPath = new TSPath();
TsPath.execute();

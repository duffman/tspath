import { TSPath } from './src/tspath';
import { argv } from 'yargs';

const TsPath = new TSPath();
TsPath.execute(argv);

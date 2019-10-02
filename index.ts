import { Command } from './src/Command';
import { argv } from 'yargs';
import { Arguments } from './src/lib/Arguments';

const TsPathCommand = new Command();
TsPathCommand.execute(new Arguments(argv));

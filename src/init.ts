import { Command } from './Command';
import { argv } from 'yargs';
import { Arguments } from './lib/Arguments';

const TsPathCommand = new Command();
TsPathCommand.execute(new Arguments(argv));

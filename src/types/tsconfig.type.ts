/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-10-06 19:18
 */

import { IJsonFile } from "../utils/json-file";


export interface ITSConfig {
	compilerOptions: CompilerOptions;
	exclude: [],
	include: []
}

export interface CompilerOptions {
	incremental:                             boolean;
	composite:                               boolean;
	tsBuildInfoFile:                         string;
	disableSourceOfProjectReferenceRedirect: boolean;
	disableSolutionSearching:                boolean;
	disableReferencedProjectLoad:            boolean;
	target:                                  string;
	lib:                                     string[];
	jsx:                                     string;
	experimentalDecorators:                  boolean;
	emitDecoratorMetadata:                   boolean;
	jsxFactory:                              string;
	jsxFragmentFactory:                      string;
	jsxImportSource:                         string;
	reactNamespace:                          string;
	noLib:                                   boolean;
	useDefineForClassFields:                 boolean;
	module:                                  string;
	rootDir:                                 string;
	moduleResolution:                        string;
	baseUrl:                                 string;
	paths:                                   Paths;
	rootDirs:                                any[];
	typeRoots:                               any[];
	types:                                   any[];
	allowUmdGlobalAccess:                    boolean;
	resolveJsonModule:                       boolean;
	noResolve:                               boolean;
	allowJs:                                 boolean;
	checkJs:                                 boolean;
	maxNodeModuleJsDepth:                    number;
	declaration:                             boolean;
	declarationMap:                          boolean;
	emitDeclarationOnly:                     boolean;
	sourceMap:                               boolean;
	outFile:                                 string;
	outDir:                                  string;
	removeComments:                          boolean;
	noEmit:                                  boolean;
	importHelpers:                           boolean;
	importsNotUsedAsValues:                  string;
	downlevelIteration:                      boolean;
	sourceRoot:                              string;
	mapRoot:                                 string;
	inlineSourceMap:                         boolean;
	inlineSources:                           boolean;
	emitBOM:                                 boolean;
	newLine:                                 string;
	stripInternal:                           boolean;
	noEmitHelpers:                           boolean;
	noEmitOnError:                           boolean;
	preserveConstEnums:                      boolean;
	declarationDir:                          string;
	preserveValueImports:                    boolean;
	isolatedModules:                         boolean;
	allowSyntheticDefaultImports:            boolean;
	esModuleInterop:                         boolean;
	preserveSymlinks:                        boolean;
	forceConsistentCasingInFileNames:        boolean;
	strict:                                  boolean;
	noImplicitAny:                           boolean;
	strictNullChecks:                        boolean;
	strictFunctionTypes:                     boolean;
	strictBindCallApply:                     boolean;
	strictPropertyInitialization:            boolean;
	noImplicitThis:                          boolean;
	useUnknownInCatchVariables:              boolean;
	alwaysStrict:                            boolean;
	noUnusedLocals:                          boolean;
	noUnusedParameters:                      boolean;
	exactOptionalPropertyTypes:              boolean;
	noImplicitReturns:                       boolean;
	noFallthroughCasesInSwitch:              boolean;
	noUncheckedIndexedAccess:                boolean;
	noImplicitOverride:                      boolean;
	noPropertyAccessFromIndexSignature:      boolean;
	allowUnusedLabels:                       boolean;
	allowUnreachableCode:                    boolean;
	skipDefaultLibCheck:                     boolean;
	skipLibCheck:                            boolean;
}

export interface Paths {
}

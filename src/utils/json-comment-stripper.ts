/*=--------------------------------------------------------------=

 TSPath - Typescript Path Resolver

 Author : Patrik Forsberg
 Email  : patrik.forsberg@coldmind.com
 GitHub : https://github.com/duffman

 I hope this piece of software brings joy into your life, makes
 you sleep better knowing that you are no longer in path hell!

 Use this software free of charge, the only thing I ask is that
 you obey to the terms stated in the license, i would also like
 you to keep the file header intact.

 Also, I would love to see you getting involved in the project!

 Enjoy!

 This software is subject to the LGPL v2 License, please find
 the full license attached in LICENCE.md

 =---------------------------------------------------------------=

 Json Comment Stripper

 Simple Parser used to strip block and line comments form a
 JSON formatted string.

 Worth knowing: The parser treat " and ' the same, so it´s
 possible to start a string with " and end it with '

 This file is part of the TypeScript Path Igniter Project:
 https://github.com/duffman/ts-path-igniter

 Author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 Date: 2017-09-02

=---------------------------------------------------------------= */

enum JsonParserState {
	None,
	InLineComment,
	InBlockComment,
	InObject,
	InQuote,
}

export class JsonCommentStripper {
	private currState = JsonParserState.None;
	private prevtState = JsonParserState.None;

	constructor() {}

	public stripComments(data: string) {
		return this.parse(data);
	}

	private isQuote(char: string): boolean {
		return char == '"' || char == "'";
	}

	private setState(state: JsonParserState) {
		if (state != this.currState) {
			this.prevtState = this.currState;
			this.currState = state;
		}
	}

	private inState(state: JsonParserState) {
		return this.currState == state;
	}

	private setPrevState() {
		this.setState(this.prevtState);
	}

	private inComment(): boolean {
		return this.inState(JsonParserState.InLineComment) || this.inState(JsonParserState.InBlockComment);
	}

	parse(data: string): string {
		// let lineNum = 1;
		// let linePos = 1;

		// let prevChar = "";
		let currChar = "";
		let aheadChar = "";

		let chunk = "";

		for (let i = 0; i < data.length; i++) {
			// prevChar = currChar;
			currChar = data[i];
			aheadChar = data[i + 1];

			// linePos++;

			if (currChar == "\n") {
				if (this.inState(JsonParserState.InLineComment)) {
					this.setState(JsonParserState.None);
				}

				// linePos = 1;
				// lineNum++;
			}

			// Allow block comments everywhere except in quotes
			if (currChar == "/" && aheadChar == "*" && !this.inState(JsonParserState.InQuote)) {
				i++;
				this.setState(JsonParserState.InBlockComment);
				continue;
			}

			if (currChar == "/" && aheadChar == "/" && this.inState(JsonParserState.None)) {
				i++;
				this.setState(JsonParserState.InLineComment);
				continue;
			}

			// If this is an end block comment, return to the previous state
			if (currChar == "*" && aheadChar == "/" && this.inState(JsonParserState.InBlockComment)) {
				i++;
				this.setPrevState();
				continue;
			}

			if (this.isQuote(currChar) && this.inState(JsonParserState.None)) {
				this.setState(JsonParserState.InQuote);
			} else if (this.isQuote(currChar) && this.inState(JsonParserState.InQuote)) {
				this.setState(JsonParserState.None);
			}

			if (!this.inComment()) chunk += currChar;
		}

		return chunk;
	}
}

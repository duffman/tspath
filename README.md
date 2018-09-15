# TSPath
#### TypeScript Path Alias Resolver

***

:warning: **Important!** There have been reports of shaky behaviour when tspath
is run with node 9.x, I am looking into the issue, if one of you who reported it
happened to see where the problem occurs, please share :)

***

Everyone working in a TypeScript project that grows beyond a certains limit will
eventually experience the situation commonly described as **path hell**, the snippet
below is an example of such hell.

##### Path hell
```typescript
 import { IgniterApplication } from "../../../Application/IgniterApplication";
 import { CrcCalculator }      from "../../../../../../../Utilities/FileUtilities";
 import { IMessageHandler }    from "../../../../Messaging/IMessageHandler";
 import { IMessageHub }        from "../../../../Messaging/Hub/IMessageHub";
 import { CronTabHelper }      from "../../../../../../../Utilities/CronTabHelper";
 import { GLog }               from "../../../Application/GLog";

```

By specifying path aliases in **tsconfig.json** you can use that alias to
form an "absolute path"
 

```json
{
  "compilerOptions": {
    ...
    "paths": {
      "@App/*":         ["./Application/*"],
      "@Messaging/*":   ["./Messaging/*"],
      "@Utils/*":       ["./Server/Tools/Utilities/*"]
    }
  }
}
```

Below is the sample example but with **Path Aliases** instead of relative paths added,
as you can see, the readability have improved significantly!

```typescript
 import { IgniterApplication } from "@App/IgniterApplication";
 import { CrcCalculator }      from "@Utilils/FileUtilities";
 import { IMessageHandler }    from "@Messaging/IMessageHandler";
 import { IMessageHub }        from "@Messaging/Hub/IMessageHub";
 import { CronTabHelper }      from "@Utils/CronTabHelper";
 import { GLog }               from "@App/GLog";

```
The TypeScript compiler will be able to resolve the paths so this will compile
without problems, however the JavaScript output will not be possible to execute
by Node nor a Web Browser, why? the reason is simple!

The JavaScript engine does not know anything about the compile time 
TypeScript configuration.

In order to run your JavaScript code, the path aliases now needs to be made into
relative paths again, here is when **TSPath** comes into play.

So, simply run:
```bash
$ tspath
```
Yes, that´s it, really!


Say bye bye to the relative path hell!

import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if(process.platform!=='win32')throw Error('This startup installer is for Windows.');
const appRoot=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const runtime=path.join(appRoot,'.local','server');
fs.mkdirSync(runtime,{recursive:true});
const supervisor=path.join(appRoot,'scripts','local-server.mjs');
const launcher=path.join(runtime,'start-hidden.vbs');
const taskName='ProtoLocalPrototype4173';
const quoted=value=>'"'+value.replaceAll('"','""')+'"';
const command=`"${process.execPath}" "${supervisor}"`;
const vbs=`' Proto local supervisor; generated for ${appRoot}\r\nOption Explicit\r\nDim shell, result\r\nSet shell = CreateObject("WScript.Shell")\r\nshell.CurrentDirectory = ${quoted(appRoot)}\r\nDo\r\n  result = shell.Run(${quoted(command)}, 0, True)\r\n  If result = 0 Then Exit Do\r\n  WScript.Sleep 5000\r\nLoop\r\nWScript.Quit result\r\n`;
fs.writeFileSync(launcher,vbs,'utf16le');
// WScript detects a Unicode VBScript from its BOM.
fs.writeFileSync(launcher,Buffer.concat([Buffer.from([0xff,0xfe]),fs.readFileSync(launcher)]));
const psQuote=value=>"'"+value.replaceAll("'","''")+"'";
const powershell=path.join(process.env.WINDIR,'System32','WindowsPowerShell','v1.0','powershell.exe');
const wscript=path.join(process.env.WINDIR,'System32','wscript.exe');
const setup=`$ErrorActionPreference='Stop';
$taskName=${psQuote(taskName)}; $launcher=${psQuote(launcher)};
$prior=Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue;
if($prior -and ($prior.Actions.Arguments -notcontains ('"'+$launcher+'"'))){throw 'Task name belongs to another action; refusing replacement.'}
$user=[System.Security.Principal.WindowsIdentity]::GetCurrent().Name;
$action=New-ScheduledTaskAction -Execute ${psQuote(wscript)} -Argument ('"'+$launcher+'"') -WorkingDirectory ${psQuote(appRoot)};
$trigger=New-ScheduledTaskTrigger -AtLogOn -User $user;
$principal=New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited;
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew;
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Local Proto localhost4173, hidden supervisor and recovery, current user only.' -Force | Out-Null;
Start-ScheduledTask -TaskName $taskName;
Get-ScheduledTask -TaskName $taskName | Select-Object TaskName,State,@{n='Enabled';e={$_.Settings.Enabled}},@{n='Trigger';e={$_.Triggers[0].CimClass.CimClassName}} | ConvertTo-Json -Compress;`;
const result=spawnSync(powershell,['-NoProfile','-NonInteractive','-Command',setup],{windowsHide:true,encoding:'utf8'});
let receipt={installedAt:new Date().toISOString(),appRoot,node:process.execPath,launcher,taskName,mode:'scheduled-task',exit:result.status};
if(result.status===0){
 receipt.task=JSON.parse(result.stdout.trim());
}else{
 // Per-user Startup needs no elevation. It runs the same hidden recovery launcher.
 const startup=path.join(process.env.APPDATA,'Microsoft','Windows','Start Menu','Programs','Startup');
 const entry=path.join(startup,'ProtoLocalPrototype4173.vbs');
 fs.mkdirSync(startup,{recursive:true});
 if(fs.existsSync(entry)&&!fs.readFileSync(entry).includes(Buffer.from('Proto local supervisor','utf16le')))throw Error('Startup entry belongs to another script.');
 fs.copyFileSync(launcher,entry);
 const run=spawnSync(powershell,['-NoProfile','-NonInteractive','-Command',`Start-Process -FilePath ${psQuote(wscript)} -ArgumentList ${psQuote('"'+launcher+'"')} -WindowStyle Hidden`],{windowsHide:true,encoding:'utf8'});
 if(run.status!==0)throw Error('Could not launch the local supervisor.');
 receipt={...receipt,mode:'user-startup',startupEntry:entry,schedulerError:result.stderr.trim()};
}
// Retire only the known legacy Proto shortcut, preserving a recoverable copy.
const legacyEntry=path.join(process.env.APPDATA,'Microsoft','Windows','Start Menu','Programs','Startup','Proto Transport localhost.lnk');
if(fs.existsSync(legacyEntry)){
 const backup=path.join(runtime,'legacy-startup',Date.now()+'-Proto Transport localhost.lnk');
 const legacyScript=path.join(process.env.USERPROFILE,'Desktop','Proto','prototype-app','Start-Prototype.ps1');
 const inspect=spawnSync(powershell,['-NoProfile','-NonInteractive','-Command',`
$ErrorActionPreference='Stop'; $entry=${psQuote(legacyEntry)};
$shortcut=(New-Object -ComObject WScript.Shell).CreateShortcut($entry);
$old=${psQuote(legacyScript)}; $current=${psQuote(path.join(appRoot,'Start-Prototype.ps1'))};
if($shortcut.Arguments.Contains($old) -or $shortcut.Arguments.Contains($current)){
 New-Item -ItemType Directory -Path ${psQuote(path.dirname(backup))} -Force | Out-Null;
 Move-Item -LiteralPath $entry -Destination ${psQuote(backup)} -ErrorAction Stop;
 Write-Output 'archived';
}else{throw 'Legacy shortcut is unrelated; left untouched.'}`],{windowsHide:true,encoding:'utf8'});
 receipt.legacyStartup={archived:inspect.status===0,backup:inspect.status===0?backup:null};
 if(inspect.status!==0)receipt.legacyStartup.warning=inspect.stderr.trim();
}
fs.writeFileSync(path.join(runtime,'installation.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({mode:receipt.mode,task:receipt.task||null,startupEntry:receipt.startupEntry||null,launcher:receipt.launcher},null,2));

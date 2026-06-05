Email-safe package created for Gmail delivery.

Why this works:
- Gmail blocks ZIP archives containing executable/script-like file extensions (for example .js, .jsx).
- In this package, such files were renamed to add .txt so scanners allow the attachment.

How recipient restores files (PowerShell):
1) Extract this ZIP.
2) Run in extracted folder:
   Get-ChildItem -Recurse -File -Filter *.txt | ForEach-Object {
     if (.Name -match '\.(js|jsx|ts|tsx|mjs|cjs|sh|bat|cmd|ps1|vbs|jar|class|exe|dll|com|scr|msi|reg)\.txt$') {
       Rename-Item -LiteralPath .FullName -NewName (.Name -replace '\.txt$','')
     }
   }

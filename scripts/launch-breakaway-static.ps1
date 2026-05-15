$signature = @"
using System;
using System.Runtime.InteropServices;

public static class NativeProcess
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct STARTUPINFO
    {
        public Int32 cb;
        public string lpReserved;
        public string lpDesktop;
        public string lpTitle;
        public Int32 dwX;
        public Int32 dwY;
        public Int32 dwXSize;
        public Int32 dwYSize;
        public Int32 dwXCountChars;
        public Int32 dwYCountChars;
        public Int32 dwFillAttribute;
        public Int32 dwFlags;
        public Int16 wShowWindow;
        public Int16 cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct PROCESS_INFORMATION
    {
        public IntPtr hProcess;
        public IntPtr hThread;
        public Int32 dwProcessId;
        public Int32 dwThreadId;
    }

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CreateProcess(
        string lpApplicationName,
        string lpCommandLine,
        IntPtr lpProcessAttributes,
        IntPtr lpThreadAttributes,
        bool bInheritHandles,
        uint dwCreationFlags,
        IntPtr lpEnvironment,
        string lpCurrentDirectory,
        ref STARTUPINFO lpStartupInfo,
        out PROCESS_INFORMATION lpProcessInformation
    );

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool CloseHandle(IntPtr hObject);
}
"@

Add-Type -TypeDefinition $signature

$startup = New-Object NativeProcess+STARTUPINFO
$startup.cb = [System.Runtime.InteropServices.Marshal]::SizeOf($startup)
$processInfo = New-Object NativeProcess+PROCESS_INFORMATION

$application = 'D:\softDir\node\node.exe'
$commandLine = '"D:\softDir\node\node.exe" "D:\mianshiti\scripts\serve-static.mjs" "D:\mianshiti\web\docs-site\build" 3000'
$flags = 0x00000008 -bor 0x00000200 -bor 0x01000000 -bor 0x08000000

$ok = [NativeProcess]::CreateProcess(
    $application,
    $commandLine,
    [IntPtr]::Zero,
    [IntPtr]::Zero,
    $false,
    $flags,
    [IntPtr]::Zero,
    'D:\mianshiti',
    [ref]$startup,
    [ref]$processInfo
)

if (-not $ok) {
    $code = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
    throw "CreateProcess failed with Win32 error $code"
}

[NativeProcess]::CloseHandle($processInfo.hThread) | Out-Null
[NativeProcess]::CloseHandle($processInfo.hProcess) | Out-Null
Write-Output "PID=$($processInfo.dwProcessId)"

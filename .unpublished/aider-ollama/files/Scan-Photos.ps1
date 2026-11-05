#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-Config {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Configuration file not found: $Path"
    }
    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Get-MediaFiles {
    param($Config)
    if (-not (Test-Path -LiteralPath $Config.rootFolder)) {
        throw "Photo folder not found: $($Config.rootFolder)"
    }
    $extensions = @($Config.photoExtensions) + @($Config.videoExtensions)
    Get-ChildItem -LiteralPath $Config.rootFolder -Recurse -File |
        Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() }
}

function Get-ExifDates {
    param([string]$Folder)
    # One exiftool call for the whole tree instead of one per file; unreadable files are skipped silently
    $json = & exiftool -json -recurse -quiet -quiet -dateFormat '%Y-%m-%dT%H:%M:%S' -DateTimeOriginal -CreateDate $Folder 2>$null
    $dates = @{}
    if (-not $json) { return $dates }
    foreach ($item in ($json | Out-String | ConvertFrom-Json)) {
        $tag = $item.PSObject.Properties['DateTimeOriginal'] ?? $item.PSObject.Properties['CreateDate']
        if ($tag) {
            # ConvertFrom-Json already turns ISO 8601 strings into [datetime]
            $dates[$item.SourceFile] = [datetime]$tag.Value
        }
    }
    return $dates
}

function Get-MediaType {
    param($Config, [System.IO.FileInfo]$File)
    if (@($Config.photoExtensions) -contains $File.Extension.ToLowerInvariant()) { 'photo' } else { 'video' }
}

function Export-PhotoList {
    param($Config, $Files, [hashtable]$ExifDates)
    $rows = foreach ($file in $Files) {
        $taken = $ExifDates[$file.FullName]
        [pscustomobject]@{
            FullPath   = $file.FullName
            Name       = $file.Name
            Type       = Get-MediaType -Config $Config -File $file
            SizeKB     = [math]::Round($file.Length / 1KB, 1)
            DateTaken  = ($taken ?? $file.CreationTime).ToString('yyyy-MM-dd HH:mm:ss')
            DateSource = if ($taken) { 'exif' } else { 'file' }
        }
    }
    $csv = Join-Path $Config.outputFolder 'photos.csv'
    $rows | Export-Csv -LiteralPath $csv -NoTypeInformation -Encoding utf8
    return $csv
}

function Get-TotalBytes {
    param($Files)
    # Measure-Object returns no Sum at all for an empty list, which StrictMode refuses
    $total = [long]0
    foreach ($file in $Files) { $total += $file.Length }
    return $total
}

function Export-FolderSummary {
    param($Config, $Files)
    $rows = $Files | Group-Object DirectoryName | Sort-Object Name | ForEach-Object {
        $photos = @($_.Group | Where-Object { (Get-MediaType -Config $Config -File $_) -eq 'photo' })
        $videos = @($_.Group | Where-Object { (Get-MediaType -Config $Config -File $_) -eq 'video' })
        $photoBytes = Get-TotalBytes -Files $photos
        $videoBytes = Get-TotalBytes -Files $videos
        [pscustomobject]@{
            Folder   = $_.Name
            Photos   = $photos.Count
            PhotosMB = [math]::Round($photoBytes / 1MB, 1)
            Videos   = $videos.Count
            VideosMB = [math]::Round($videoBytes / 1MB, 1)
            TotalMB  = [math]::Round(($photoBytes + $videoBytes) / 1MB, 1)
        }
    }
    $csv = Join-Path $Config.outputFolder 'folders.csv'
    $rows | Export-Csv -LiteralPath $csv -NoTypeInformation -Encoding utf8
    $rows | Format-Table -AutoSize | Out-Host
    return $csv
}

$config = Read-Config -Path (Join-Path $PSScriptRoot 'photos.config.json')
$files = @(Get-MediaFiles -Config $config)
$exifDates = Get-ExifDates -Folder $config.rootFolder

$csv = Export-PhotoList -Config $config -Files $files -ExifDates $exifDates
Write-Host "$($files.Count) files written to $csv"

$folderCsv = Export-FolderSummary -Config $config -Files $files
Write-Host "Folder summary written to $folderCsv"

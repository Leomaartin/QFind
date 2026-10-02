Add-Type -AssemblyName System.Drawing

$darkPath = (Resolve-Path "public\logo-dark.png").Path
$whitePath = (Resolve-Path "public\logo-white.png").Path

function Create-RoundedRectanglePath($rect, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $arc = New-Object System.Drawing.Rectangle $rect.X, $rect.Y, $diameter, $diameter

    $path.AddArc($arc, 180, 90)
    $arc.X = $rect.Right - $diameter
    $path.AddArc($arc, 270, 90)
    $arc.Y = $rect.Bottom - $diameter
    $path.AddArc($arc, 0, 90)
    $arc.X = $rect.X
    $path.AddArc($arc, 90, 90)
    $path.CloseFigure()
    return $path
}

# 1. Option A: Pure transparent with dark logo centered
$logoDark = [System.Drawing.Image]::FromFile($darkPath)
$bmpA = New-Object System.Drawing.Bitmap 256, 256
$gA = [System.Drawing.Graphics]::FromImage($bmpA)
$gA.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gA.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$hA = [int](240 * $logoDark.Height / $logoDark.Width)
$yA = [int]((256 - $hA) / 2)
$gA.DrawImage($logoDark, 8, $yA, 240, $hA)
$bmpA.Save("scratch\test_opt_a.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gA.Dispose()
$bmpA.Dispose()
$logoDark.Dispose()

# 2. Option B: Navbar pill badge with white logo (exactly like the dark navbar)
$logoWhite = [System.Drawing.Image]::FromFile($whitePath)
$bmpB = New-Object System.Drawing.Bitmap 256, 256
$gB = [System.Drawing.Graphics]::FromImage($bmpB)
$gB.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gB.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$rectB = New-Object System.Drawing.Rectangle 8, 8, 240, 240
$pathB = Create-RoundedRectanglePath $rectB 48
$p1 = New-Object System.Drawing.Point 0, 8
$p2 = New-Object System.Drawing.Point 0, 248
$c1 = [System.Drawing.Color]::FromArgb(255, 24, 38, 35)
$c2 = [System.Drawing.Color]::FromArgb(255, 14, 23, 21)
$brushB = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
$gB.FillPath($brushB, $pathB)
$penB = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 20, 184, 166)), 4
$gB.DrawPath($penB, $pathB)

$hB = [int](200 * $logoWhite.Height / $logoWhite.Width)
$yB = [int]((256 - $hB) / 2)
$gB.DrawImage($logoWhite, 28, $yB, 200, $hB)
$bmpB.Save("scratch\test_opt_b.png", [System.Drawing.Imaging.ImageFormat]::Png)
$brushB.Dispose()
$penB.Dispose()
$gB.Dispose()
$bmpB.Dispose()
$logoWhite.Dispose()

Write-Output "Done creating test options"

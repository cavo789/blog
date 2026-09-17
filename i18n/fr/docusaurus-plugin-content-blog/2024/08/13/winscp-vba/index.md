---
slug: winscp-vba
title: WinSCP - utilisation avec Visual Basic for Application
date: 2024-08-13
description: Automatisez des transferts de fichiers SFTP/FTP sécurisés directement depuis MS Office. Découvrez comment appeler les DLL WinSCP avec du code Visual Basic for Application (VBA), exemple pratique à l'appui.
authors: [christophe]
image: /img/v2/winscp.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - vba
  - winscp
language: fr
review_date: 2026-07-30
---
![WinSCP - utilisation avec Visual Basic for Application](/img/v2/winscp.webp)

<TLDR>
Cet article montre comment appeler la bibliothèque .NET/COM de WinSCP depuis VBA (par exemple dans Excel) pour automatiser des transferts de fichiers sécurisés : un objet `Session` se connecte en SFTP avec l'host, les identifiants et l'empreinte de la clé SSH, puis `PutFiles` envoie les fichiers, avec une gestion d'erreurs via `On Error Resume Next` et une boucle sur les résultats qui confirme chaque transfert.
</TLDR>

[WinSCP](https://winscp.net/) est un gestionnaire de fichiers gratuit et open-source qui permet de transférer des fichiers en toute sécurité entre votre machine et des serveurs distants, via des protocoles comme SFTP, FTP, SCP et WebDAV.

Saviez-vous que vous pouvez appeler WinSCP depuis ... du code VBA ?

Voir [https://winscp.net/eng/docs/library_vb#using](https://winscp.net/eng/docs/library_vb#using). Il y a aussi plusieurs sujets sur le forum : [https://winscp.net/forum/search.php?mode=results](https://winscp.net/forum/search.php?mode=results)

<!-- truncate -->

Les DLL de [WinSCP](https://winscp.net/) peuvent être appelées depuis du code VBA, ce qui permet donc d'envoyer ou de télécharger un fichier vers ou depuis un serveur FTP.

*Si VBA n'est pas une obligation, WinSCP peut faire la même chose avec son propre langage de script, bien plus simple ; voir <Link to="/blog/winscp-synchronize-both">WinSCP - Synchronize host and remote</Link> et <Link to="/blog/winscp-download-recursively-files">WinSCP - Download files with specific extension recursively</Link>.*

Voici un exemple VBA simple que vous pouvez utiliser dans MS Excel, par exemple, pour envoyer un fichier sur votre serveur distant.

```vbnet
Option Explicit

Sub Example()

    Dim mySession As New Session

    ' Enable custom error handling
    On Error Resume Next

    Upload mySession

    ' Query for errors
    If Err.Number <> 0 Then
        MsgBox "Error: " & Err.Description

        ' Clear the error
        Err.Clear
    End If

    ' Disconnect, clean up
    mySession.Dispose

    ' Restore default error handling
    On Error GoTo 0

End Sub

Private Sub Upload(ByRef mySession As Session)

    ' Setup session options
    Dim mySessionOptions As New SessionOptions
    With mySessionOptions
        .Protocol = Protocol_Sftp
        .HostName = "example.com"
        .UserName = "user"
        .Password = "mypassword"
        .SshHostKeyFingerprint = "ssh-rsa 2048 xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx"
    End With

    ' Connect
    mySession.Open mySessionOptions

    ' Upload files
    Dim myTransferOptions As New TransferOptions
    myTransferOptions.TransferMode = TransferMode_Binary

    Dim transferResult As TransferOperationResult
    Set transferResult = mySession.PutFiles("c:\temp\*", "/home/user/", False, myTransferOptions)

    ' Throw on any error
    transferResult.Check

    ' Display results
    Dim transfer As TransferEventArgs
    For Each transfer In transferResult.Transfers
        MsgBox "Upload of " & transfer.Filename & " succeeded"
    Next

End Sub
```

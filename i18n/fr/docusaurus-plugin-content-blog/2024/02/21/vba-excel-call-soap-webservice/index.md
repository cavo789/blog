---
slug: vba-excel-call-soap-webservice
title: MS Excel - Comment appeler un web service SOAP
date: 2024-02-21
description: Maîtrisez l'appel de web services SOAP depuis MS Excel avec VBA. Récupérez le code et un tutoriel pas à pas pour valider des numéros de TVA avec le service VIES.
authors: [christophe]
image: /img/v2/excel.webp
series: VBA & MS Office automation
mainTag: excel
tags:
  - api
  - excel
  - vba
language: fr
review_date: 2026-07-30
---
![MS Excel - Comment appeler un web service SOAP](/img/v2/excel.webp)

<TLDR>
Cet article présente un squelette VBA pour appeler un web service SOAP depuis Excel, avec le service européen VIES de validation des numéros de TVA comme exemple concret : construction d'un fichier XML de requête avec des placeholders, envoi via `MSXML2.ServerXMLHTTP60`, puis ouverture de la réponse XML dans un nouveau classeur. Un équivalent Linux basé sur `curl` est également inclus pour comparaison.
</TLDR>

Imaginez que vous deviez appeler un web service SOAP depuis Excel. Par exemple, pour valider un numéro de TVA qu'on vous a communiqué avant de lancer un traitement.

Vous allez appeler l'URL qui correspond au web service souhaité, mais il faudra aussi transmettre un certain nombre de paramètres au format XML pour que le service sache ce que vous voulez faire.

Dans ce billet, nous allons voir comment valider un numéro de TVA européen à l'aide du web service SOAP [VIES VAT number validation](https://ec.europa.eu/taxation_customs/vies/#/vat-validation).

Le code VBA présenté ici peut servir de squelette pour vos futurs développements.

*Ce même service VIES sert d'exemple fil rouge dans <Link to="/blog/postman">Using Postman to play with API</Link>, où la réponse XML est vérifiée nœud par nœud — une bonne façon de comprendre une réponse SOAP avant d'écrire le VBA qui la parse.*

<!-- truncate -->

Lorsqu'on appelle un service SOAP, il faut toujours préparer un message XML au préalable. Pour cela, nous créons un fichier .xml quelque part sur notre disque dur.

## Créer le message xml {#create-the-xml-message}

Créez le fichier `C:\temp\checkVat.xml` avec ce contenu. Ce message (contenu) est celui attendu par le web service VIES de validation de numéro de TVA. Dans le fichier, nous prévoyons deux placeholders pour nos variables : `%COUNTRY%` et `%VATNUMBER%`. Nous y reviendrons plus loin.

<Snippet filename="C:\temp\checkVat.xml" source="./files/checkVat.xml" />

## Créer le classeur Excel {#create-the-excel-workbook}

Maintenant, procédez comme suit :

1. Créez un classeur Excel vide,
2. Appuyez sur <kbd>ALT</kbd>-<kbd>F11</kbd> pour ouvrir l'éditeur Visual Basic (aussi appelé `vbe`).
3. Créez un nouveau module :
    ![Créer un nouveau module](./images/insert_module.webp)
4. Copiez/collez-y le code VBA ci-dessous.
5. Vérifiez le chemin de la constante `InputXmlFile`. Assurez-vous qu'il correspond à l'endroit où vous avez enregistré votre fichier `.xml`.
6. Cliquez sur le menu `Tools` puis sélectionnez `References` et ajoutez une référence vers `Microsoft XML, v6.0`
    ![Tools - References](./images/tools_references.webp)
    ![Microsoft XML, v6.0](./images/microsoft_xml6.webp)
7. Enfin, placez le curseur n'importe où dans la sous-routine `run` et appuyez sur <kbd>F5</kbd> pour l'exécuter.
    ![Activer la sous-routine run](./images/sub_run.webp)
8. Après quelques secondes, un nouveau classeur sera créé avec la réponse du web service SOAP :
    ![Réponse SOAP](./images/soap_answer.webp)

```vbnet
Option Explicit

' URL to call
Const URL = "http://ec.europa.eu/taxation_customs/vies/services/checkVatService"

' XML to send to the web service method
Const InputXmlFile = "C:\temp\checkVat.xml"

' *************************************************************
'
' Entry point
'
'    - Call the web service checkVAT method
'    - Upload XML data (country and VAT number)
'    - Get XML response
'    - Open the response as a workbook
'
' *************************************************************
Sub run()

    Dim sData As String
    Dim sResponseFileName As String

    ' Get the input manifest
    sData = openCheckVatXml(InputXmlFile)

    ' Consume the web service and get a filename with the response
    If (sData = "") Then
        MsgBox "Failure, the " & InputXmlFile & " file didn't exist", vbExclamation + vbOKOnly
        Exit Sub
    End If

    sResponseFileName = consumeWebService(URL, sData)

    ' Open the response as a workbook
    Call Application.Workbooks.OpenXML(Filename:=sResponseFileName)

End Sub

' *************************************************************
'
' Open the checkVat.xml input and replace variables
'
' *************************************************************
Private Function openCheckVatXml(ByVal sFileName As String) As String

    Dim sData As String

    sData = readFile(sFileName)

    If (sData <> "") Then
        sData = Replace(sData, "%COUNTRY%", "BE")
        sData = Replace(sData, "%VATNUMBER%", "0403170701") ' ENGIE Electrabel Belgique
    End If

    openCheckVatXml = sData

End Function

' *************************************************************
'
' Generic file reader. Return the content of the text file
'
' *************************************************************
Private Function readFile(ByVal sFileName As String) As String

    Dim objFso As Object
    Dim objFile As Object
    Dim sContent As String

    Set objFso = CreateObject("Scripting.FileSystemObject")

    If Not (objFso.FileExists(sFileName)) Then
        ' The file didn't exist
        readFile = ""
        Exit Function
    End If

    Set objFile = objFso.OpenTextFile(sFileName, 1)

    sContent = objFile.readAll

    objFile.Close

    Set objFile = Nothing
    Set objFso = Nothing

    readFile = sContent

End Function

' *************************************************************
'
' Return a filename with the response of the web service method
'
' *************************************************************
Private Function consumeWebService(ByVal sURL As String, ByVal sData As String) As String

    Dim xmlhttp As Object
    Dim sResponseFileName As String

    Set xmlhttp = New MSXML2.ServerXMLHTTP60  ' Requires Microsoft XML, v6.0

    xmlhttp.Open "POST", sURL, True
    xmlhttp.send sData
    xmlhttp.waitForResponse

    sResponseFileName = createXmlTempFile(xmlhttp.responseText)

    Set xmlhttp = Nothing

    consumeWebService = sResponseFileName

End Function

' *************************************************************
'
' Create a temporary file in the TEMP folder and write in that
' file the XML response received by the web service.
'
' Return the temporary filename as result of this function
'
' *************************************************************
Private Function createXmlTempFile(ByVal sContent As String) As String

    Dim objFso As Object
    Dim objFile As Object
    Dim objFolder As Object
    Dim sFileName As String

    Set objFso = CreateObject("Scripting.FileSystemObject")

    ' 2 = temporary folder
    Set objFolder = objFso.GetSpecialFolder(2)
    sFileName = objFolder & "\"
    Set objFolder = Nothing

    sFileName = sFileName & objFso.GetTempName()
    sFileName = Replace(sFileName, ".tmp", ".xml")

    Set objFile = objFso.CreateTextFile(sFileName)

    objFile.Write sContent

    objFile.Close

    Set objFile = Nothing
    Set objFso = Nothing

    createXmlTempFile = sFileName

End Function
```

### À propos des placeholders {#about-placeholders}

Dans notre fichier `C:\temp\checkVat.xml`, nous avons donc prévu deux placeholders.

Vous pouvez voir dans la sous-routine VBA `openCheckVatXml` comment nous les remplaçons par des valeurs d'exemple. Adaptez-les simplement aux vôtres.

## Une version en ligne de commande Linux {#a-linux-command-line-version}

Pour ceux que ça intéresse, voici une autre façon d'obtenir le même résultat, mais depuis une console Linux (ou DOS si vous avez curl installé) :

```bash
curl --silent http://ec.europa.eu/taxation_customs/vies/services/checkVatService   \
  -w \\n                                          \
  -H 'SOAPAction: "checkVat"'                        \
  -H "Content-Type: text/xml;charset=UTF-8"          \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <urn:checkVat xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
            <urn:countryCode>BE</urn:countryCode>
            <urn:vatNumber>0403170701</urn:vatNumber>
        </urn:checkVat>
    </soapenv:Body>
</soapenv:Envelope>'
```

<AlertBox variant="info" title="Ajoutez `xmlstarlet` pour une sortie plus lisible">
Voyez mon article <Link to="/blog/linux-xmlstarlet">The xmlstarlet utility for Linux</Link>.

Ajoutez `| xmlstarlet format --indent-spaces 4` à la fin de la commande précédente pour envoyer la sortie vers `xmlstarlet` (voir <Link to="/blog/linux-xmlstarlet">The xmlstarlet utility for Linux</Link>)

</AlertBox>

La réponse sera :

```xml
<?xml version="1.0"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
    <env:Header/>
    <env:Body>
        <ns2:checkVatResponse xmlns:ns2="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
            <ns2:countryCode>BE</ns2:countryCode>
            <ns2:vatNumber>0403170701</ns2:vatNumber>
            <ns2:requestDate>2024-01-07+01:00</ns2:requestDate>
            <ns2:valid>true</ns2:valid>
            <ns2:name>SA ELECTRABEL</ns2:name>
            <ns2:address>Boulevard Simon Bolivar 36\n1000 Bruxelles</ns2:address>
        </ns2:checkVatResponse>
    </env:Body>
</env:Envelope>
```

À vous maintenant de modifier le code VBA et de l'adapter à vos besoins.

Si vous concevez le côté API plutôt que de simplement la consommer, lisez <Link to="/blog/php-api-tips">API REST - How to write good APIs</Link> pour le contexte général de conception d'API.

---
slug: vba-excel-call-soap-webservice
title: MS Excel - How to call a SOAP webservice
authors: [christophe]
image: /img/excel_tips_social_media.jpg
tags: [excel, ribbon, soap, vba]
enableComments: true
---
# MS Excel - How to call a SOAP webservice

![MS Excel - How to call a SOAP webservice](/img/excel_tips_header.jpg)

For this blog post, the use case will be **you need to check the authenticity of a European VAT number; this using MS Excel**.

Above all, it's an illustration to show you how to call a SOAP-type web service in Excel, i.e. one that requires a certain call format and value passing in order to then retrieve the data.

To do this, we'll use the [VIES VAT number validation](https://ec.europa.eu/taxation_customs/vies/#/vat-validation) SOAP webservice.

<!-- truncate -->

When calling a SOAP service, you must always prepare your XML message first. To do this, we create an .xml file somewhere on our hard drive.

Please create the file `C:\temp\checkVat.xml` with this content:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <urn:checkVat xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
            <urn:countryCode>%COUNTRY%</urn:countryCode>
            <urn:vatNumber>%VATNUMBER%</urn:vatNumber>
        </urn:checkVat>
    </soapenv:Body>
</soapenv:Envelope>
```

This is the message expected by the VIES VAT number web service. In that file, we foresee two placeholders for our variables: `%COUNTRY%` and `%VATNUMBER%`. We'll see this later on.

Now, 

1. Create an empty Excel workbook,
2. Press <kbd>ALT</kbd>-<kbd>F11</kbd> to get the Visual Basic Editor (aka `vbe`).
3. Create a new module:

![Create a new module](./images/insert_module.png)

4. Copy/Paste the VBA code from here below to it.
5. Check the path for the `InputXmlFile` constant. Make sure it's the same than where you've saved your `.xml` file earlier.
6. Click on the `Tools` menu then select `References` and add a reference to `Microsoft XML, v6.0`

![Tools - References](./images/tools_references.png)

![Microsoft XML, v6.0](./images/microsoft_xml6.png)

1. Finally, put the cursor anywhere in the `run` subroutine and press <kbd>F5</kbd> to run it.

![Activate run subroutine](./images/sub_run.png)

8. After a few seconds, a new workbook will be created with the answer from the SOAP web service:

![SOAP answer](./images/soap_answer.png)



```vba
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
        MsgBox "Failure, the " & InputXmlFile & " file didn't exists", vbExclamation + vbOKOnly
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
        ' The file didn't exists
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
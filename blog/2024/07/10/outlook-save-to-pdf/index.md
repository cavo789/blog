---
slug: outlook-vba-pdf
title: Microsoft Outlook - VBA - Save emails as PDF 
authors: [christophe]
image: /img/vba_tips_social_media.jpg
tags: [outlook, vba]
enableComments: true
---
![Microsoft Outlook - VBA - Save emails as PDF](/img/vba_tips_banner.jpg)

You may also need to select several emails from Microsoft Outlook and save them as PDF files on your hard drive.

In my case, it was when I was complementary self-employed. I had to keep track of the orders I received and the invoices I sent. Saving my orders as PDFs meant that I could keep them as archives, even if my mail server failed.

This post will explain to you how to create such macro for Outlook.

<!-- truncate -->

## Prerequisites

You should have Microsoft Office on your hard disk and you need to have Outlook and Word installed.

The macro will not work with Office online.

## Installation steps

1. Just start your Microsoft Outlook client (as software on your hard disk; not in your web browser),
2. Press <kbd>ALT</kbd>+<kbd>F11</kbd> to open the `Visual Basic Editor` (aka `VBE`) window,
3. Click on the `Insert` menu then `Module`,
4. Click on the link [https://github.com/cavo789/vba_outlook_save_pdf/blob/master/module.bas](https://github.com/cavo789/vba_outlook_save_pdf/blob/master/module.bas) to open my repository on GitHub and click on the `Copy raw file` button to copy the source code in the clipboard,
   ![Copy Raw File](images/copy_raw_file.png)
5. Back to Outlook and press <kbd>CTRL</kbd>+<kbd>V</kbd> in the editor so you paste there the code,
   ![Paste](images/vba.png)
6. Close the `Visual Basic Editor` and come back to Outlook,
7. Click anywhere on the Ribbon and select `Customize the Ribbon...`
   ![Customize the ribbon](images/right_click.png)
8. In the new dialog, click on the `New Group` button
   ![Create a New Group](images/new_group.png)
9. In the *Choose commands from*, select `Macros`, you should see the `SaveAsPDFFile` macro as illustrated below
   ![SaveAsPDFFile](images/macros.png)
10. Drag and drop the macro to your new group.
    ![Drag and drop the macro](images/drag_and_drop.png)
11. Click on the `OK` button to close the dialog.

You should see your new group, in my case, I've created the new group in `Home` and at the first position left so I've this:

![The new group](images/ribbon_macro.png)

## How to use

Select one or more emails then click on your new button.

The macro will ask a first confirmation:

![Five emails selected](images/five_emails_selected.png)

Press `Yes` to continue.

Then, you'll be prompted to select a folder on your disk where to save emails as PDF.

![Where emails should be saved?](images/where_to_save.png)

The first dialog will ask if, once exported as PDF, you wish to keep emails in Outlook and remove them.

And the last dialog will ask if you wish to give a name manually to each file (if you've selected five emails, you'll be prompted five times for a filename) or if you wish to use the subject of the email as filename.

At the end, emails have been saved on your hard disk.

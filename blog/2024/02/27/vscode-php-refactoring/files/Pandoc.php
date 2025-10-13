<?php

namespace Avonture;

class Pandoc
{
    public function download(string $filename): void
    {
        $filename = Sanitize::sanitizeFileName(trim($filename));

        if ('' == $filename) {
            throw new PandocFileNotSpecified();
        }

        if (!is_file($this->outputFolder . $filename)) {
            throw new PandocFileNotFound($filename);
        }

        // Make the filename absolute
        $filename = $this->outputFolder . ltrim($filename, self::DS);

        $this->outputType = pathinfo($filename)['extension'];

        $contentType = $this->getContentType()['type'];

        header('Content-Type: ' . $contentType);
        header('Content-Transfer-Encoding: ' . $this->getContentType()['encoding']);

        header('Content-Disposition: attachment; filename="' . basename($filename) . '"');
        header('Content-Length: ' . filesize(utf8_decode($filename)));
        header('Accept-Ranges: bytes');
        header('Pragma: no-cache');
        header('Expires: 0');

        ob_end_flush();

        @readfile(utf8_decode($filename));
    }
}

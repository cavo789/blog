<?php

$finder = PhpCsFixer\Finder::create()
    ->in('.')
    ->exclude([
        '.config',
        '.devcontainer',
        '.git',
        'node_modules',
        'vendor'
    ]);

$header = file_get_contents(__DIR__ . '/licenseHeader.txt');

$config = new PhpCsFixer\Config();

return $config->setRules(
    [
        '@PSR12' => true,
        'header_comment' => [
            'header'       => rtrim($header, "\r\n"),
            'location'     => 'after_declare_strict',
            'comment_type' => 'PHPDoc',
        ],
    ]
)
    ->setCacheFile('/tmp/.php-cs-fixer.cache')
    ->setIndent('    ')
    ->setLineEnding("\n")
    ->setFinder($finder);

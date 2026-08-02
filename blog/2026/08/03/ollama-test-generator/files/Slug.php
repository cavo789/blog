<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Turn a human title into a URL-friendly slug.
 */
final class Slug
{
    public static function make(string $title): string
    {
        $slug = strtolower(trim($title));

        // Everything that is not a letter or a digit becomes a separator,
        // then repeated separators are collapsed into a single dash.
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim((string) $slug, '-');

        if ($slug === '') {
            throw new \InvalidArgumentException('Title produces an empty slug');
        }

        return $slug;
    }
}

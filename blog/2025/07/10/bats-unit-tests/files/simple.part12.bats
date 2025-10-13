@test "html::removeTopOfFileComments - remove HTML comments - with empty lines" {
    tempfile="$(mktemp)"

    # Here, we'll have extra, empty, lines. They should be removed too
    echo '' >$tempfile
    echo '' >>$tempfile
    echo '' >>$tempfile
    echo '<!--  ' >>$tempfile # We also add extra spaces before the start tag
    echo '   Lorem ipsum dolor sit amet, consectetur adipiscing elit.' >>$tempfile
    echo '   Morbi interdum elit a nisi facilisis pulvinar.' >>$tempfile
    echo '   Vestibulum fermentum consequat suscipit. Vestibulum id sapien metus.' >>$tempfile
    echo '-->     ' >>$tempfile # We also add extra spaces after the end tag
    echo '' >>$tempfile
    echo '' >>$tempfile
    echo '<html><body/></html>' >>$tempfile

    run html::removeTopOfFileComments "$tempfile"

    # Get now the content of the file
    #   We expect three empty lines (the three first)
    #       The HTML comment has been removed
    #   Then there are two more empty line (so we'll five empty lines)
    #   And we'll have our "<html><body/></html>" block.
    #
    #   cat --show-ends --show-tabs will show the dollar sign (end-of-line) and f.i. ^I for tabulations
    #   tr "\n" "#" will then convert the line feed character to a hash so, in fact, fileContent will
    #   be a string like `$#$#$#$#$#<html><body/></html>$#`
    fileContent="$(cat --show-ends --show-tabs "$tempfile" | tr "\n" "#")"

    # Once we've our string, compare the fileContent with our expectation
    assert_equal "$fileContent" "\$#\$#\$#\$#\$#<html><body/></html>\$#"
}

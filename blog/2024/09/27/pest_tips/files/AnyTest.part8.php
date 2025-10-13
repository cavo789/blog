it('has a welcome page', function() {
    $response = $this->get('/');
    expect($response)->toMatchSnapshot();
});

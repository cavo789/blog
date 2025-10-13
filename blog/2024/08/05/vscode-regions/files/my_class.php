<?php

class MyClass
{
    public function onContentPrepare()
    {
        $query = $this->db->getQuery(true);
        $query->select('note');
        $query->from('#__content_ratings');
        $query->where('content_id = 8');

        $this->db->setQuery($query);
        $notes = $this->db->loadColumn();

        return $notes;
    }
}

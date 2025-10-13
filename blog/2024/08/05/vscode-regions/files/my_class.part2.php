<?php

class MyClass
{
    public function onContentPrepare()
    {
        //region 1. Prepare the SQL query
        $query = $this->db->getQuery(true);
        $query->select('note');
        $query->from('#__content_ratings');
        $query->where('content_id = 8');
        //endregion

        //region 2. Run the query
        $this->db->setQuery($query);
        $notes = $this->db->loadColumn();
        //endregion

        //region 3. Prepare resulting array
        return $notes;
        //endregion
    }
}

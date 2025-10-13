<?php
abstract class mycollection implements Iterator
{
    protected function populate($array, $dataobject){
foreach($array as $item){
            $object = new $dataobject();
            foreach($item as $key => $val){$object->$key = $val;}
  $this->storage[] = $object;
}}
}

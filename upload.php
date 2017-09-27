<?php
    $file = $_FILES["file"];
    if(!isset($file['tmp_name']) || !$file['tmp_name']) {
        echo json_encode(array('code' => 401, 'msg' => '没有文件上传'));
        return false;
    }
    if($file["error"] > 0) {
        echo json_encode(array('code' => 402, 'msg' => $file["error"]));
        return false;
    }

    $upload_path = $_SERVER['DOCUMENT_ROOT']."/uploads/images/";
    $file_path   = 'http://' . $_SERVER['HTTP_HOST']."/uploads/images/";

    if(!is_dir($upload_path)){
        echo json_encode(array('code' => 403, 'msg' => '上传目录不存在'));
        return false;
    }

    if(move_uploaded_file($file["tmp_name"], $upload_path.$file['name'])){
        echo json_encode(array('code' => 200, 'src' => $file_path.$file['name']));
        return false;
    }else{
        echo json_encode(array('code' => 404, 'msg' => '上传失败'));
        return false;
    }
?>
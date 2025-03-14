import React, { useEffect, useRef } from "react";
import { message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  deleteProductImage,
  getUploadProductImageSign,
} from "../../services/productService";
import axios from "axios";

const UploadImage = ({
  fileList = [], // 接收对象数组 [{url: "xxx", ...}]
  onChange,
  changeSubmitBtnLoadings,
}) => {
    const latestValue = useRef(fileList);

    useEffect(() => {
        latestValue.current = fileList;
    }, [fileList]);


  // 转换工具函数：将外部数据格式转为 Upload 需要的格式
  const convertToUploadFormat = (list) => {
    return list.map((item) => ({
      uid: item.uid || item.url, // 优先使用现有 uid，否则用 url 作为唯一标识
      name: item.name || item.url.split("/").pop(),
      status: "done", // 标记为已上传完成
      url: item.url,
      picturebedId: item.picturebedId,
      size: item.size,
    }));
  };

  // 自定义上传逻辑
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      changeSubmitBtnLoadings(true);
      const sign = await getUploadProductImageSign();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("sign", sign.sign);
      formData.append("id", sign.id);
      formData.append("ts", sign.ts);
      formData.append("compress", true);

      const { data } = await axios.post(
        `https://api.superbed.cn/upload`,
        formData
      );

      if (data.err !== 0) throw new Error(data.msg);

      setTimeout(() => {
        const newList = [
            ...latestValue.current,
            {
              url: data.url,
              picturebedId: data.id,
              name: data.name,
              size: data.size,
              uid: file.uid,
            },
          ];
    
          // 更新父组件数据（函数式更新保证数据一致性）
          onChange(newList);
      }, 0);
      onSuccess("Success");
      message.success("图片上传成功！");
    } catch (error) {
      onError(error);
      message.error(error.message || "上传失败");
    } finally {
      changeSubmitBtnLoadings(false);
    }
  };

  // 删除图片逻辑
  const onRemoveImage = async (file) => {
    try {
      changeSubmitBtnLoadings(true);
      await deleteProductImage([file.picturebedId]);

      // 更新父组件数据
      onChange(fileList.filter((f) => f.picturebedId !== file.picturebedId));

      message.success("删除成功");
    } catch (error) {
      message.error(error.message);
    } finally {
      changeSubmitBtnLoadings(false);
    }
  };

  return (
    <Upload
      fileList={convertToUploadFormat(fileList)} // 实时转换格式
      customRequest={customUpload}
      listType="picture-card"
      previewFile={(file) => file.url} // 确保预览生效
      beforeUpload={(file) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) message.error("只能上传图片文件");
        return isImage;
      }}
      onRemove={onRemoveImage}
      accept="image/*"
      multiple
      maxCount={5}
    >
      {fileList.length >= 5 ? null : (
        <div>
          <UploadOutlined />
          <div>上传图片（最多5张）</div>
        </div>
      )}
    </Upload>
  );
};

export default UploadImage;

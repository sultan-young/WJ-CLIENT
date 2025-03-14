export const updateImageValidator = () => ({
    validator(_, fileList) {
      if ((fileList || []).length >= 1) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("至少上传一张图片"));
    },
  })
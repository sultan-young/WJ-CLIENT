import React from 'react';
import { Image } from 'antd';

const ImageGallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  const getGridStyle = () => {
    let columns = 1;
    if (images.length > 1 && images.length <= 4) columns = 2;
    if (images.length > 4) columns = 3;

    return {
      display: 'grid',
      gap: 8,
      gridTemplateColumns: `repeat(${columns}, 1fr)`
    };
  };

  return (
    <Image.PreviewGroup>
      {images.length === 1 ? (
        <Image
          src={images[0]}
          style={{ maxWidth: '100%', display: 'block' }}
        />
      ) : (
        <div style={getGridStyle()}>
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                paddingBottom: '100%', // 保持1:1宽高比
                cursor: 'pointer'
              }}
            >
              <Image
                src={img}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                preview={{ visible: false }} // 禁用默认预览按钮
              />
            </div>
          ))}
        </div>
      )}
    </Image.PreviewGroup>
  );
};

export default ImageGallery;
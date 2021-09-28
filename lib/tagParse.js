// https://www.awaresystems.be/imaging/tiff/tifftags/aliaslayermetadata.html

function parseLayerMetadata (data) {
  const p = /^(\d{3}), (\d{3}), ([A-Fa-f0-9]{8}), (\d{3}), (\d{1,3}), 000, 000, 000, 000, 000, 000, 000, 000, 000, 000$/.exec(data);
  const [_, LayerCount, CurrentLayer, BackgroundColor, ReducedImageCount] = p;
  return LayerCount;
};

module.exports = {
  parseLayerMetadata
};

const Content = require("../models/Content");
const { asyncHandler } = require("../middlewares/errorMiddleware");

exports.getContentByType = asyncHandler(async (req, res) => {

  const { type } = req.params;

  const page = await Content.findOne({ type });

  if (!page) {
    return res.status(404).json({
      status: false,
      message: "Content not found"
    });
  }

  res.status(200).json({
    status: true,
    data: {
      title: page.title,
      last_updated: page.last_updated,
      content_html: page.content_html
    }
  });

});

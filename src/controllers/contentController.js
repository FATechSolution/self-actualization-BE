import Audio from "../models/Audio.js";
import Video from "../models/Video.js";
import Article from "../models/Article.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const parsePaginationParams = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

// Shared listing logic factory
const buildListHandler = (Model, searchFields = ["title"]) =>
  asyncHandler(async (req, res) => {
    const { search, category } = req.query;
    const { limit, page, skip } = parsePaginationParams(req.query);

    const filters = { isActive: true };

    if (category) {
      filters.category = category.trim();
    }

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      if (searchFields.length === 1) {
        filters[searchFields[0]] = regex;
      } else {
        filters.$or = searchFields.map((field) => ({ [field]: regex }));
      }
    }

    const [items, total] = await Promise.all([
      Model.find(filters)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments(filters),
    ]);

    res.json({
      success: true,
      page,
      limit,
      total,
      data: items,
    });
  });

export const getAudios = buildListHandler(Audio, ["title"]);
export const getVideos = buildListHandler(Video, ["title"]);
export const getArticles = buildListHandler(Article, ["title"]);

// Simple detail handlers that only return active items

export const getAudioByIdPublic = asyncHandler(async (req, res) => {
  const audio = await Audio.findOne({ _id: req.params.id, isActive: true }).lean();

  if (!audio) {
    return res.status(404).json({ success: false, error: "Audio not found" });
  }

  res.json({ success: true, data: audio });
});

export const getVideoByIdPublic = asyncHandler(async (req, res) => {
  const video = await Video.findOne({ _id: req.params.id, isActive: true }).lean();

  if (!video) {
    return res.status(404).json({ success: false, error: "Video not found" });
  }

  res.json({ success: true, data: video });
});

export const getArticleByIdPublic = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ _id: req.params.id, isActive: true }).lean();

  if (!article) {
    return res.status(404).json({ success: false, error: "Article not found" });
  }

  res.json({ success: true, data: article });
});



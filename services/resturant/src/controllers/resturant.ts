import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Resturant from "../models/Resturant.js";
import jwt from "jsonwebtoken";
export const addResturant = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const exitingResturant = await Resturant.findOne({
    ownerId: user?._id.toString(),
  });
  if (exitingResturant) {
    return res.status(400).json({
      message: "Restaurant already exists for this owner",
    });
  }
  const { name, description, longitude, latitude, formattedAddress, phone } =
    req.body;
  if (!name || !longitude || !latitude) {
    return res.status(400).json({
      message: "Please provide all required fields",
    });
  }
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "Please upload an image",
    });
  }
  const fileBuffer = getBuffer(file);
  if (!fileBuffer?.content) {
    return res.status(500).json({
      message: "failed to create file buffer",
    });
  }
  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVER}/api/upload`,
    {
      buffer: fileBuffer.content,
    },
  );
  const resturant = await Resturant.create({
    name,
    description,
    phone,
    image: uploadResult.url,
    ownerId: user._id.toString(),
    isVerified: false,
    autoLocation: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
      formattedAddress,
    },
  });
  return res.status(201).json({
    message: "Resturant created successfully",
    resturant,
  });
});

export const fetchMyResturant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const resturant = await Resturant.findOne({
      ownerId: user?._id.toString(),
    });
    if (!resturant) {
      return res.status(404).json({
        message: "no resturant found for this user",
      });
    }
    if (!user.resturantId) {
      const token = jwt.sign(
        {
          user: { ...user, resturantId: resturant._id },
        },
        process.env.JWT_SEC as string,
        {
          expiresIn: "15d",
        },
      );
      return res.json({
        resturant,
        token,
      });
    }

    res.json({
      resturant,
    });
  },
);

export const updateStatusResturant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Please login to continue",
      });
    }
    const { status } = req.body;
    if (typeof status !== "boolean") {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }
    const resturant = await Resturant.findOneAndUpdate(
      {
        ownerId: user._id.toString(),
      },
      { isOpen: status },
      { new: true },
    );
    if (!resturant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }
    res.json({
      message: "Restaurant status updated successfully",
      resturant,
    });
  },
);

export const updateResturant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Please login to continue",
      });
    }
    const { name, description } = req.body;
    const resturant = await Resturant.findOneAndUpdate(
      {
        ownerId: user._id.toString(),
      },
      { name, description },
      { new: true },
    );
    if (!resturant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }
    res.json({
      message: "Restaurant  updated successfully",
      resturant,
    });
  },
);
export const getNearByResturant = TryCatch(async (req, res) => {
  const { longitude, latitude, radius = 5000, search = "" } = req.query;
  if (!longitude || !latitude) {
    return res.status(400).json({
      message: "Please provide both longitude and latitude",
    });
  }
  const query: any = {
    isVerified: true,
  };
  if (search && typeof search === "string") {
    query.name = { $regex: search, $options: "i" };
  }
  const resturants = await Resturant.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        maxDistance: Number(radius),
        spherical: true,
        query,
      },
    },
    {
      $sort: { isOpen: -1, distance: 1 },
    },
    {
      $addFields: {
        distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
      },
    },
  ]);
  res.json({
    success: true,
    count: resturants.length,
    resturants,
  });
});

export const fetchSingleResturant = TryCatch(async (req, res) => {
  const resturant = await Resturant.findById(req.params.id);
  res.json({ resturant });
});

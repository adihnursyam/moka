export const mediaPolicy = {
  image: { maxFileSize: "32MB" as const, maxFileCount: 10, applicationMaxBytes: 20 * 1024 * 1024 },
  video: { maxFileSize: "512MB" as const, maxFileCount: 1 },
  pdf: { maxFileSize: "64MB" as const, maxFileCount: 5 },
};

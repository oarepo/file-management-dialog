import { rest } from "msw";
import article from "../mock/__fixtures__/article.pdf";
import article2 from "../mock/__fixtures__/article2.pdf";
import article3 from "../mock/__fixtures__/article3.pdf";
import figure from "../mock/__fixtures__/figure.png";

const baseUrl = window.location.origin;

const handlers = [
  rest.get(`${baseUrl}/api/records/:id/files`, (req, res, ctx) => {
    const query = req.params;

    return res(
      ctx.json({
        default_preview: null,
        enabled: true,
        entries: [
          {
            "key": "figure.png",
            "updated": "2020-11-27 11:26:04.607831",
            "created": "2020-11-27 11:17:10.998919",
            "checksum": "md5:6ef4267f0e710357c895627e931f16cd",
            "mimetype": "image/png",
            "size": 89364.0,
            "status": "completed",
            "metadata": {
              "caption": "Figure 1",
              "featured": true
            },
            "file_id": "2151fa94-6dc3-4965-8df9-ec73ceb91T5c",
            "version_id": "57ad8c66-b934-49c9-a46f-38bf5aa0374f",
            "bucket_id": "90b5b318-114a-4b87-bc9d-0d018b9363d3",
            "storage_class": "S",
            "links": {
              "content": `${baseUrl}/api/records/${query.id}/files/figure.png/content`,
              "self": `${baseUrl}/api/records/${query.id}/files/figure.png`,
              "commit": `${baseUrl}/api/records/${query.id}/files/figure.png/commit`
            }
          },
          {
            "key": "article.pdf",
            "updated": "2020-11-27 11:26:04.607831",
            "created": "2020-11-27 11:17:10.998919",
            "checksum": "md5:6ef4267f0e710357c895627e931f16cd",
            "mimetype": "application/pdf",
            "size": 89364546.0,
            "status": "completed",
            "metadata": null,
            "file_id": "2151fa94-6dc3-4935-8df9-efafgeb9175c",
            "version_id": "57ad8c66-b934-49c9-a46f-38bfsda0374f",
            "bucket_id": "90b5b318-114a-4b87-bc9d-0d0f439363d3",
            "storage_class": "S",
            "links": {
              "content": `${baseUrl}/api/records/${query.id}/files/article.pdf/content`,
              "self": `${baseUrl}/api/records/${query.id}/files/article.pdf`,
              "commit": `${baseUrl}/api/records/${query.id}/files/article.pdf/commit`
            }
          },
          {
            "key": "article2.pdf",
            "updated": "2020-11-27 11:26:04.607831",
            "created": "2020-11-27 11:17:10.998919",
            "checksum": "md5:6ef4267f0e710357c895627e931f16cd",
            "mimetype": "application/pdf",
            "size": 89364546.0,
            "status": "completed",
            "metadata": null,
            "file_id": "2151fa94-6dc3-4235-8df9-ecafgeb9175c",
            "version_id": "57ad8c66-b934-49c9-a46f-38bfsda0374f",
            "bucket_id": "90b5b318-114a-4b87-bc9d-0d0f439363d3",
            "storage_class": "S",
            "links": {
              "content": `${baseUrl}/api/records/${query.id}/files/article2.pdf/content`,
              "self": `${baseUrl}/api/records/${query.id}/files/article2.pdf`,
              "commit": `${baseUrl}/api/records/${query.id}/files/article2.pdf/commit`
            }
          },
          {
            "key": "article3.pdf",
            "updated": "2020-11-27 11:26:04.607831",
            "created": "2020-11-27 11:17:10.998919",
            "checksum": "md5:6ef4267f0e710357c895627e931f16cd",
            "mimetype": "application/pdf",
            "size": 89364546.0,
            "status": "completed",
            "metadata": null,
            "file_id": "2151fa94-6dc3-4935-8df9-ecafgeb8175c",
            "version_id": "57ad8c66-b934-49c9-a46f-38bfsda0374f",
            "bucket_id": "90b5b318-114a-4b87-bc9d-0d0f439363d3",
            "storage_class": "S",
            "links": {
              "content": `${baseUrl}/api/records/${query.id}/files/article3.pdf/content`,
              "self": `${baseUrl}/api/records/${query.id}/files/article3.pdf`,
              "commit": `${baseUrl}/api/records/${query.id}/files/article3.pdf/commit`
            }
          }
        ],
        links: {
          self: `${baseUrl}/api/records/${query.id}/files`,
        },
        order: [],
      })
    );
  }),
  // Download file
  rest.get(
    `${baseUrl}/api/records/:id/files/:fileName/content`,
    async (req, res, ctx) => {
      const fileName = req.params.fileName.replace(/\.[^/.]+$/, "");
      const importedFile =
        fileName === "article"
          ? article
          : fileName === "article2"
          ? article2
          : fileName === "article3"
          ? article3
          : fileName === "figure"
          ? figure
          : null;
      // Load and return the PDF file here
      const pdfFile = await fetch(importedFile).then((res) =>
        res.arrayBuffer()
      );
      return res(
        ctx.set("Content-Type", "application/pdf"),
        ctx.set("Content-Disposition", "inline"),
        ctx.body(pdfFile)
      );
    }
  ),
  rest.post(`${baseUrl}/api/records/:id/files`, async (req, res, ctx) => {
    const body = await req.json();
    const query = req.params;

    // Invalid file name being a trigger for server error
    if (body.some((obj) => obj.key.startsWith("invalid"))) {
      return res(
        ctx.status(400),
        ctx.json({
          "message": `File with key ${body[0].key} already exists.`
        })
      );
    }

    const entries = body.map((obj) => ({
      key: obj.key,
      updated: "2020-11-27 11:17:11.002624",
      created: "2020-11-27 11:17:10.998919",
      metadata: null,
      status: "pending",
      links: {
        content: `/api/records/${query.id}/draft/files/${obj.key}/content`,
        self: `/api/records/${query.id}/draft/files/${obj.key}`,
        commit: `/api/records/${query.id}/draft/files/${obj.key}/commit`,
      },
    }));

    return res(
      ctx.json({
        enabled: true,
        default_preview: null,
        order: [],
        entries,
        links: {
          self: `/api/records/${query.id}/files`,
        },
      })
    );
  }),
  // metadata:
  rest.put(
    `${baseUrl}/api/records/:id/files/:fileName`,
    async (req, res, ctx) => {
      const body = await req.json();
      const query = req.params;

      // Invalid file name being a trigger for server error
      // if (query.fileName.startsWith("invalid")) {
      //   return res(
      //     ctx.status(500),
      //     ctx.json({
      //       key: query.fileName,
      //       updated: "2020-11-27 11:17:11.002624",
      //       created: "2020-11-27 11:17:10.998919",
      //       metadata: null,
      //       status: "pending",
      //       links: {
      //         content: `/api/records/${query.id}/draft/files/invalid.sh/content`,
      //         self: `/api/records/${query.id}/draft/files/invalid.sh`,
      //         commit: `/api/records/${query.id}/draft/files/invalid.sh/commit`,
      //       },
      //     })
      //   );
      // }

      return res(
        ctx.json({
          key: query.fileName,
          updated: "2020-11-27 11:17:11.002624",
          created: "2020-11-27 11:17:10.998919",
          metadata: body,
          status: "pending",
          links: {
            content: `/api/records/${query.id}/draft/files/${query.fileName}/content`,
            self: `/api/records/${query.id}/draft/files/${query.fileName}`,
            commit: `/api/records/${query.id}/draft/files/${query.fileName}/commit`,
          },
        })
      );
    }
  ),
  rest.put(
    `${baseUrl}/api/records/:id/files/:fileName/content`,
    async (req, res, ctx) => {
      const query = req.params;
      return res(
        ctx.json({
          key: query.fileName,
          // data: body,
          updated: "2020-11-27 11:17:11.002624",
          created: "2020-11-27 11:17:10.998919",
          metadata: null,
          status: "pending",
          links: {
            content: `/api/records/${query.id}/draft/files/${query.fileName}/content`,
            self: `/api/records/${query.id}/draft/files/${query.fileName}`,
            commit: `/api/records/${query.id}/draft/files/${query.fileName}/commit`,
          },
        })
      );
    }
  ),
  rest.post(
    `${baseUrl}/api/records/:id/files/:fileName/commit`,
    (req, res, ctx) => {
      const query = req.params;
      return res(
        ctx.json({
          key: query.fileName,
          updated: "2020-11-27 11:26:04.607831",
          created: "2020-11-27 11:17:10.998919",
          checksum: "md5:6ef4267f0e710357c895627e931f16cd",
          mimetype: "image/png",
          size: 89364.0,
          status: "completed",
          metadata: null,
          file_id: "2151fa94-6dc3-4965-8df9-ec73ceb9175c",
          version_id: "57ad8c66-b934-49c9-a46f-38bf5aa0374f",
          bucket_id: "90b5b318-114a-4b87-bc9d-0d018b9363d3",
          storage_class: "S",
          links: {
            content: `/api/records/${query.id}/draft/files/${query.fileName}/content`,
            self: `/api/records/${query.id}/draft/files/${query.fileName}`,
            commit: `/api/records/${query.id}/draft/files/${query.fileName}/commit`,
          },
        })
      );
    }
  ),
  rest.delete(
    `${baseUrl}/api/records/:id/files/:fileName`,
    (req, res, ctx) => {
      return res(
        ctx.status(204),
        // ctx.status(400)
      );
    }
  ),
];

export default handlers;

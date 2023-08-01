export default [
  {
    url: "/api/records/:id/files",
    method: "get",
    response: ({ query }) => {
      return {
        default_preview: null,
        enabled: true,
        entries: [
          {
            key: "figure.png",
            updated: "2020-11-27 11:17:11.002624",
            created: "2020-11-27 11:17:10.998919",
            metadata: null,
            status: "pending",
            links: {
              content: `/api/records/${query.id}/draft/files/figure.png/content`,
              self: `/api/records/${query.id}/draft/files/figure.png`,
              commit: `/api/records/${query.id}/draft/files/figure.png/commit`,
            },
          },
          {
            key: "article.pdf",
            updated: "2020-11-27 11:17:11.002624",
            created: "2020-11-27 11:17:10.998919",
            metadata: null,
            status: "pending",
            links: {
              content: `/api/records/${query.id}/draft/files/article.pdf/content`,
              self: `/api/records/${query.id}/draft/files/article.pdf`,
              commit: `/api/records/${query.id}/draft/files/article.pdf/commit`,
            },
          },
        ],
        links: {
          self: `/api/records/${query.id}/files`,
        },
        order: [],
      };
    },
  },
  {
    url: "/api/records/:id/files",
    method: "post",
    response: ({ body, query }) => {
      return {
        enabled: true,
        default_preview: null,
        order: [],
        entries: body.map((fileName) => {
          return {
            key: fileName,
            updated: "2020-11-27 11:17:11.002624",
            created: "2020-11-27 11:17:10.998919",
            metadata: null,
            status: "pending",
            links: {
              content: `/api/records/${
                query.id
              }/draft/files/${fileName.toString()}/content`,
              self: `/api/records/${
                query.id
              }/draft/files/${fileName.toString()}`,
              commit: `/api/records/${
                query.id
              }/draft/files/${fileName.toString()}/commit`,
            },
          };
        }),
        links: {
          self: `/api/records/${query.id}/files`,
        },
      };
    },
  },
  {
    url: "/api/records/:id/files/:fileName/content",
    method: "put",
    response: ({ query }) => {
      return {
        key: query.fileName,
        updated: "2020-11-27 11:17:11.002624",
        created: "2020-11-27 11:17:10.998919",
        metadata: null,
        status: "pending",
        links: {
          content: `/api/records/${query.id}/draft/files/${query.fileName}/content`,
          self: `/api/records/${query.id}/draft/files/${query.fileName}`,
          commit: `/api/records/${query.id}/draft/files/${query.fileName}/commit`,
        },
      };
    },
  },
  {
    url: "/api/records/:id/files/:fileName/commit",
    method: "post",
    response: ({ query }) => {
      return {
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
      };
    },
  },
];

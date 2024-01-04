import { useEffect } from "react";

const useOARepoFileSourcePlugin = (uppy, record, modifyExistingFiles, locale) => {
  useEffect(() => {
    /* fileSources: 
    [
      {
        id: '2151fa94-6dc3-4935-8df9-ecafgeb9175c', // file.file_id ?? file.key
        name: 'article.pdf', // file.key
        mimeType: 'application/pdf', // file.mimetype
        data: **to be downloaded**,
 
        isFolder: false,
        icon: "file", // TODO: add icons
        thumbnail: null // TODO: add thumbnail URLs to preview images
        requestPath: "http://localhost:5173/api/records/8t29q-nfr77/files/figure.png/content", // file.links.content
        modifiedDate: "2020-11-27 11:26:04.607831", // file.updated ?? null
        author: null,
        size: 782683, file.size ?? null
        ...
      },
      ...
    ]
    */
    const setUpOARepoFileSourcePlugin = (fileSources) => {
      uppy.getPlugin("OARepoFileSource")?.setOptions({
        fileSources: fileSources,
        fileTypeFilter: !modifyExistingFiles ? ["application/pdf"] : null,
        locale: locale?.startsWith("cs") ? czechLocale : {},
      });
    };

    const mapFilesToFileSources = (fileEntries) => {
      return fileEntries.map((file) => ({
        id: file?.file_id,
        name: file?.key,
        mimeType: file?.mimetype,
        isFolder: false,
        icon: "file",
        thumbnail: null,
        requestPath: file?.links?.content,
        modifiedDate: file?.updated,
        author: null,
        size: file?.size,
        metadata: file?.metadata,
      }));
    };

    const getTagFile = (file) => ({
      id: file.id,
      source: "OARepo",
      data: file,
      name: file.name || file.id,
      type: file.mimeType,
      isRemote: false,
      meta: file.metadata || {},
      body: {
        fileId: file.id,
      },
    });

    let fileSources = [];
    if (record.files?.enabled) {
      if (!record.files.entries) {
        fetch(record.links.files)
          .then((response) => {
            if (!response.ok)
              throw new Error(response.statusText);
            return response.json();
          })
          .then((data) => {
            fileSources = mapFilesToFileSources(data?.entries ?? []);
          })
          .catch((error) => {
            uppy.info({
              message: uppy.i18n("Error loading files."),
              details: error.message,
            }, "error", 7000);
          })
          .finally(() => {
            setUpOARepoFileSourcePlugin(fileSources);
            startEvent.event === "edit-file" && uppy.addFile(getTagFile(fileSources.find(file => file.name === startEvent.data.file_id)));
          });
      } else {
        fileSources = mapFilesToFileSources(record.files.entries);
        setUpOARepoFileSourcePlugin(fileSources);
        startEvent.event === "edit-file" && uppy.addFile(getTagFile(fileSources.find(file => file.name === startEvent.data.file_id)));
      }
    } else {
      setUpOARepoFileSourcePlugin(fileSources);
      startEvent.event === "edit-file" && uppy.addFile(getTagFile(fileSources.find(file => file.name === startEvent.data.file_id)));
    }
  }, [
    uppy,
    record.files,
    record.links?.files,
    modifyExistingFiles,
    locale,
  ]);

  return null;
}

export default useOARepoFileSourcePlugin;
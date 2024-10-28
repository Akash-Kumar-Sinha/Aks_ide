const FilesSidebar = ({
  fileStructure,
}: {
  fileStructure: Record<string, unknown | null>;
}) => {
  const renderFileTree = (tree: Record<string, unknown | null>) => {
    return Object.entries(tree).map(([name, value]) => {
      if (value !== null && typeof value === "object") {
        return (
          <div key={name}>
            <div className="text-zinc-50 font-normal">{name}</div>
            <div className="ml-4">
              {renderFileTree(value as Record<string, unknown | null>)}
            </div>
          </div>
        );
      } else {
        return (
          <div key={name} className="text-gray-400">
            {name}
          </div>
        );
      }
    });
  };

  return (
    <div className="w-52 bg-zinc-800 p-2 border-b-2 border-r-2 rounded-r-3xl border-gray-700 overflow-auto">
      <h2 className="text-white font-semibold">Explorer</h2>
      <div className="mt-1">
        {fileStructure && Object.keys(fileStructure).length > 0 ? (
          renderFileTree(fileStructure)
        ) : (
          <div className="text-gray-500">No files found</div>
        )}
      </div>
    </div>
  );
};

export default FilesSidebar;

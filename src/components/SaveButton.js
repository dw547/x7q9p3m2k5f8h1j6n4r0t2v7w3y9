import React from 'react';

const SaveButton = ({ processValues, isRTBChecked, hardmaskList }) => {
  const handleSave = async () => {
    const hardmaskListToSave = hardmaskList.map(hardmask => ({
      appname: hardmask.appname,
      appbundle: hardmask.appbundle,
      appurl: hardmask.appurl,
      os_type: hardmask.os_type,
      type: hardmask.type
    }));

    const dataToSave = {
      ...processValues,
      rtb: isRTBChecked,
      hardmaskList: hardmaskListToSave
    };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'text/plain' });
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `${processValues.process_name}.txt`,
      types: [{
        description: 'Text Files',
        accept: { 'text/plain': ['.txt'] },
      }],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  };

  return (
    <button
      onClick={handleSave}
      className="bg-green-500 hover:bg-green-700 hover:scale-105 text-white font-bold py-2 px-4 rounded"
    >
      Save Process Data
    </button>
  );
};

export default SaveButton;
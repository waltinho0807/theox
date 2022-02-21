const CONTRACT_ADDRESS = '0x6D47f7bb0D438430D3D8B132983B3FD235dF3C38';

const transformCharacterData = (characterData) => {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
    };
  };

export { CONTRACT_ADDRESS, transformCharacterData };
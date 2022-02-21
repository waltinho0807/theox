import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import NFTOx from "../../utils/NFTOx.json";
/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [nftOxContract, setNftOxContract] = useState(null);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftOxContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTOx.abi,
        signer
      );

      /*
       * This is the big difference. Set our gameContract in state.
       */
      setNftOxContract(nftOxContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log("Getting contract characters to mint");

        /*
         * Call contract to get all mint-able characters
         */
        const charactersTxn = await nftOxContract.getAllDefaultCharacters();
        console.log("charactersTxn:", charactersTxn);

        /*
         * Go through all of our characters and transform the data
         */
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        /*
         * Set all mint-able characters in state
         */
        setCharacters(characters);
      } catch (error) {
        console.error("Something went wrong fetching characters:", error);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
        console.log(
          `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
        );
    
        /*
         * Once our character NFT is minted we can fetch the metadata from our contract
         * and set it in state to move onto the Arena
         */
        if (nftOxContract) {
          const characterNFT = await nftOxContract.checkIfUserHasNFT();
          console.log('CharacterNFT: ', characterNFT);
          setCharacterNFT(transformCharacterData(characterNFT));
        }
      };

    /*
     * If our gameContract is ready, let's get characters!
     */
    if (nftOxContract) {
      getCharacters();

      nftOxContract.on('CharacterNFTMinted', onCharacterMint);
    }
  }, [nftOxContract]);

  // Render Methods
  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
          if (nftOxContract) {
            console.log('Minting character in progress...');
            const mintTxn = await nftOxContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log('mintTxn:', mintTxn);
          }
        } catch (error) {
          console.warn('MintCharacterAction Error:', error);
        }
      };
    return (
        <div className="select-character-container">
          <h2>Mint your the OX Collection NFT.</h2>
          {/* Only show this when there are characters in state */}
          {characters.length > 0 && (
            <div className="character-grid">{renderCharacters()}</div>
          )}
        </div>
      );
};

export default SelectCharacter;

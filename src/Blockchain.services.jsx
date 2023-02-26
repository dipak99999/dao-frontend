import { setGlobalState, getGlobalState } from "./store";
import abi from "./abis/Dao.json";
import { ethers } from "ethers";
import { serializeError } from "eth-rpc-errors";
import { toast } from "react-toastify";
const { provider } = new ethers.providers.Web3Provider(window.ethereum);

const connectWallet = async () => {
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    setGlobalState("connectedAccount", accounts[0].toLowerCase());
  } catch (error) {
    reportError(error);
  }
};

const isWallectConnected = async () => {
  try {
    const accounts = await provider.request({ method: "eth_accounts" });

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async () => {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
      await isWallectConnected();
      window.location.reload();
    });

    if (accounts.length) {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
    } else {
      alert("Please connect wallet.");
      console.log("No accounts found.");
    }
  } catch (error) {
    reportError(error);
  }
};

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState("connectedAccount");
  const provider1 = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider1.getSigner();

  if (connectedAccount) {
    const contract = new ethers.Contract(
      // "0x40b2fbEFF3c19a12DBD3a8D86fDd5A6d0440d244",
      "0x065c7DF35d5fDcd1c9BdD3F3208FF5116e0719b8",
      abi,
      signer
    );
    console.log("dipak");
    return contract;
  } else {
    return getGlobalState("contract");
  }
};

const performContribute = async (amount) => {
  console.log("trigger");
  try {
    const Amount = ethers.utils.parseUnits(amount.toString(), "ether");
    console.log("a", amount, Amount.toString());
    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");
    console.log("aaww", contract);
    let transactionReceipt = await contract.contribute({
      from: account,
      value: Amount,
    });

    if (await transactionReceipt.wait(1)) {
      console.log("dipak123", await transactionReceipt.wait(1));
      getInfo();
    }
  } catch (error) {
    reportError(error);
    return error;
  }
};

const getInfo = async () => {
  try {
    const contract = await getEtheriumContract();
    console.log("sww333eq", contract);
    const connectedAccount = getGlobalState("connectedAccount");
    console.log("3wwwwseeww", connectedAccount);
    const balance = await contract.daoBalance();

    console.log("3", balance);
    console.log("final", ethers.utils.formatEther(balance).toString());

    const isStakeholder = await contract.isStakeholder();

    console.log("aa", isStakeholder, connectedAccount);
    // const balance = await contract.methods.daoBalance().call()
    const mybalance = await contract.getBalance();

    console.log("aaaaaa", isStakeholder, balance, mybalance);
    setGlobalState("balance", String(ethers.utils.formatEther(balance)));
    setGlobalState("mybalance", String(ethers.utils.formatEther(mybalance)));
    setGlobalState("isStakeholder", isStakeholder);
    console.log("afcrdb", isStakeholder);
  } catch (error) {
    reportError(error);
  }
};

const raiseProposal = async ({ title, description, beneficiary, amount }) => {
  try {
    amount = ethers.utils.parseUnits(amount.toString(), "ether");
    const contract = await getEtheriumContract();

    let transactionReceipt = await contract.createProposal(
      title,
      description,
      beneficiary,
      amount
    );
    if (await transactionReceipt.wait(1)) {
      console.log("raiseProposal", await transactionReceipt.wait(1));
      getProposals();
    }
  } catch (error) {
    reportError(error);
    return error;
  }
};

const getProposals = async () => {
  try {
    const contract = await getEtheriumContract();
    const proposals = await contract.getProposals();
    console.log("dppp", proposals);
    setGlobalState("proposals", structuredProposals(proposals));
  } catch (error) {
    reportError(error);
  }
};

const structuredProposals = (proposals) => {
  return proposals.map((proposal) => ({
    id: proposal.id,
    amount: ethers.utils.formatEther(proposal.amount),
    title: proposal.title,
    description: proposal.description,
    paid: proposal.paid,
    passed: proposal.passed,
    proposer: proposal.proposer,
    upvotes: Number(proposal.upvotes),
    downvotes: Number(proposal.downvotes),
    beneficiary: proposal.beneficiary,
    executor: proposal.executor,
    duration: proposal.duration,
  }));
};

const getProposal = async (id) => {
  try {
    const proposals = getGlobalState("proposals");
    console.log("dipa", proposals);
    console.log("dipak2", proposals[id]);
    return proposals[id];
    // return proposals.find((proposal) => proposal.id === id);
    // console.log("dipak3",proposals.find((proposal) => proposal.id === id));
  } catch (error) {
    reportError(error);
  }
};

const voteOnProposal = async (proposalId, supported) => {
  try {
    const contract = await getEtheriumContract();

    let transactionReceipt = await contract.performVote(proposalId, supported);

    if (await transactionReceipt.wait(1)) {
      console.log("raiseProposal", await transactionReceipt.wait(1));
      getProposals();
    }
  } catch (error) {
    // const serializedError = serializeError(error);
    // toast.error(serializedError?.data?.originalError?.reason.split("'")[1]);
    // console.log(
    //   "aq",
    //   serializedError?.data?.originalError?.reason.split("'")[1]
    // );
    // console.log("ssssssssssssssss", error);
    reportError(error);
  }
};

const listVoters = async (id) => {
  try {
    const contract = await getEtheriumContract();
    console.log("oooooo");
    const votes = await contract.getVotesOf(id);
    console.log("sss", votes);
    return votes;
  } catch (error) {
    reportError(error);
  }
};

const payoutBeneficiary = async (id) => {
  try {
    const contract = await getEtheriumContract();

    let transactionReceipt = await contract.payBeneficiary(id);

    if (await transactionReceipt.wait(1)) {
      console.log("raiseProposal", await transactionReceipt.wait(1));
      getInfo();
      getProposals();
    }
  } catch (error) {
    reportError(error);
  }
};

const reportError = (error) => {
  // const serializedError = serializeError(error);
  // toast.error(serializedError?.data?.originalError?.reason.split("'")[1]);

  console.log(JSON.stringify(error.code), "red");
  throw new Error("No ethereum object.");
};

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
};

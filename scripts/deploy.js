async function main() {
  const Factory = await ethers.getContractFactory("MusicVote");
  const mv = await Factory.deploy();
  await mv.waitForDeployment();
  console.log("MusicVote:", await mv.getAddress());
}
main().catch((e)=>{ console.error(e); process.exit(1); });
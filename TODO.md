# General
add references

https://www.ethereum-blockchain-developer.com/


# Improvement

Consensus mechanisms
- PoS, PoW
- Raft, BFT

add transaction flowchart

transaction data (no gas/ gas needed)

market tree concept


image recover

deep study in node (How boost node is security)  

# Wallet

EOA wallet 
Smart Contract wallet
Account Abstraction

Meta mask internal



# Gas

Max token issuance, burnt token
Issue new token for gas fee? Swap smart contracts?


# Solidity

https://www.ethereum-blockchain-developer.com/


# Reference 

https://leesei.github.io/posts/blockchain


總的來說，這三張圖提供了一個簡潔明了的以太坊合併後交易生命週期的「基準」概覽。它們準確地突出了執行層（EL）和共識層（CL）之間的分離，這對於現代以太坊至關重要。

然而，它們包含一些技術上的不準確之處、拼字錯誤和重大的現實遺漏。

以下是對這些圖表正確之處、需要糾正之處和遺漏之處的分析。

圖1：交易創建與提交
它的優點：它正確地展示了用戶透過錢包簽署交易並將其提交給 RPC 節點的流程。 RPC 節點在將交易新增至其記憶體池之前，會驗證交易（檢查簽章、nonce 和 gas 餘額）。

更正/拼字錯誤：

有拼字錯誤：「PRC 節點池」應為「RPC 節點池」（或更準確地說，是節點的記憶體池）。

圖 2：流言蜚語與街區建設（基線）
它的優點：它準確地描繪了 RPC 節點如何透過「八卦」（廣播）的方式將交易資訊傳播到網路上的其他節點，使其擴散到不同的記憶體池中。它也正確地展示瞭如何偽隨機地選擇一個特定節點作為給定時隙的「提議者」。它準確地映射了本地通信，其中 CL 向 EL 請求執行有效負載以建立區塊。

更正/拼字錯誤：

拼字錯誤：“Boardcast”應為“Broadcast”。

拼字錯誤：“Proposor”應為“Proposer”。

重大現實遺漏：此圖展示的是原生/本地區塊建構方式。實際上，超過 90% 的以太坊驗證者不再使用自己的 EL 記憶體池在本地建立區塊。相反，他們透過 MEV-Boost 使用提案者-建構者分離 (PBS) 技術。專門的「建構者」建立最有利可圖的區塊，並透過「中繼」將其發送給提案者。

圖3：區塊傳播與驗證
它正確的地方：它正確地展示了提案者如何透過共識層（CL）將新建構的區塊發送到網路的其他部分。它還正確地展示了接收節點的共識層如何將區塊傳遞給其執行層（EL），執行層使用執行虛擬機器（EVM）來驗證狀態變更並更新本地鏈。

關鍵技術錯誤： * 步驟 2 提到「在節點的記憶體池中尋找交易」。這對於區塊驗證來說是錯誤的。當節點從提議者收到新區塊時，執行邏輯 (EL) 不會在其自身的記憶體池中搜尋交易。交易已經打包在提議者發送的區塊有效載荷中。 EL 只是獲取區塊中提供的交易列表，透過執行虛擬機器 (EVM) 按順序執行這些交易，並檢查生成的根狀態是否與區塊中提議的根狀態相符。 （驗證完成後，EL會從其記憶體池中移除已確認的交易，但它並未使用記憶體池來執行驗證。）

簡要判決
如果您使用這些圖表來理解以太坊的基本預期架構（原始區塊生產），它們是很好的教育工具，前提是您修正了第三張圖片中的步驟 2 錯誤。

但是，如果你想解釋以太坊如今在生產環境中是如何實際運作的，你需要第四張圖來解釋MEV（礦工可提取價值）和區塊構建器，因為圖 2 中所示的本地區塊構建在很大程度上已經過時了。
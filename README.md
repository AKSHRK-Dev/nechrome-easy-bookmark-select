# Easy Bookmark Select

ブックマークを、サイドパネルでドラッグして並べ替えられる拡張機能です。

- アイコンを押すとサイドパネルが開き、ブックマークバー・その他のブックマークの中身が並びます。
- ドラッグで並べ替え。フォルダの上に落とすと、そのフォルダの中へ入ります。
- フォルダを押すと中に入り、ブックマークを押すとそのページを開きます。
- ブックマークバーなど、ほかの場所で変えた内容もすぐ反映されます。

## 入れ方
1. [Releases](https://github.com/AKSHRK-Dev/nechrome-easy-bookmark-select/releases/latest) から `nechrome-easy-bookmark-select.zip` をダウンロードして、展開します。
2. NeChrome（または Chrome）で `chrome://extensions` を開き、右上の「デベロッパー モード」をオンにします。
3. 「パッケージ化されていない拡張機能を読み込む」を押し、展開したフォルダの中の `src` を選びます。
4. 拡張機能のアイコン（パズルの形）から固定すると、URL バーのすぐ右に出ます。

NeChrome でも Chrome でも使えます（標準の `chrome.bookmarks` API だけを使います）。

## ライセンス
MIT License

Developed by [ASHIKA Group](https://group.ashikanw.com/)

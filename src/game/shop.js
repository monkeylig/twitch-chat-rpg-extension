import React, { useCallback, useState } from 'react';
import useAsync from '../common/useAsync';
import backend from '../common/backend-calls';
import RPGUI from '../common/rpg-ui-elements';

function ShopMenu({player, onPlayerChanged}) {
    const getShop = useCallback(() => backend.getShop(), []);
    const [data, isPending, error] = useAsync(getShop);

    return (        
        <div>
            {isPending && <h1>Loading Shop</h1>}
            {data && <Shop shopData={data} player={player} onPlayerChanged={onPlayerChanged}/>}
            {error && <p>Shop failed to load</p>}
        </div>
    );
}

function Shop({shopData, player, onPlayerChanged}) {
    const [selectedProduct, setSelectedProduct] = useState();

    const onBuyClicked = () => {
        backend.buy(player.id, shopData.id, selectedProduct.id)
        .then(player => {
            onPlayerChanged(player);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    let dialogFunction;
    let dialogParams;
    if(selectedProduct) {
        const canAfford = player.coins >= selectedProduct.price;
        switch(selectedProduct.type) {
            case 'weapon': {
                const owned = player.bag.weapons.find(element => element.name === selectedProduct.product.name) !== undefined;
                dialogFunction = RPGUI.WeaponDialog;
                dialogParams = {
                    weapon: selectedProduct.product,
                    price: selectedProduct.price,
                    onBuyClicked,
                    owned,
                    canAfford: canAfford
                };
                break;
            }
            case 'item': {
                const itemInBag = player.bag.items.find(element => element.name === selectedProduct.product.name)
                dialogFunction = RPGUI.ItemDialog;
                dialogParams = {
                    item: selectedProduct.product,
                    price: selectedProduct.price,
                    onBuyClicked,
                    amountOwned: itemInBag ? itemInBag.count : 0,
                    canAfford: canAfford
                };
                break;
            }
        }
    }

    const onShopItemClicked = (shopItem) => {
        setSelectedProduct(shopItem);
        const dialog = document.getElementById('shop-dialog');
        dialog.showModal();
    };

    const shopItems = shopData.products.map((shopItem) => {
        return (
            <RPGUI.ContainerItem name={shopItem.product.name} price={shopItem.price}
                imageSrc={backend.getResourceURL(shopItem.product.icon)} coinImageSrc={backend.getResourceURL(shopData.coinIcon)} 
                onClick={() => onShopItemClicked(shopItem)} key={shopItem.id}/>
        );
    });

    return (
        <>
            <h1>{shopData.title}</h1>
            <h3>Coin Balance - {player.coins}</h3>
            <div className='item-container'>
                {shopItems}
            </div>
            <RPGUI.DialogControl id='shop-dialog' dialogFunction={dialogFunction} dialogParams={dialogParams}/>
        </>
    );
}

export default ShopMenu;
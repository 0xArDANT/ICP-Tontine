// Importation des éléments nécessaires

import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from "uuid"

type Tontine = Record<
{
    name : string;
    numberOfMembers : number;
    amount: number;
    intervalInDays : number;
    id: string;
}
>;

const tontineTable = new StableBTreeMap<string, Tontine>(0,44,512);

$update;
export function createTontine(
    _name: string, 
    _numberOfMembers: number, 
    _amount: number, 
    _intervalInDays: number 
    ) : string {

        const tontine = {
            name : _name,
            numberOfMembers: _numberOfMembers,
            amount : _amount,
            intervalInDays : _intervalInDays,
            id: uuidv4(),
        };

        tontineTable.insert(tontine.id, tontine);
        return tontine.id;

    }

$query;
export function getTontine(idTontine: string) : Tontine {
    const tontine = tontineTable.get(idTontine);
    return match(tontine, {
        Some: (t) => t,
        None: () => ({} as unknown as Tontine),
    });
}

// A workaround to make the uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    },
};


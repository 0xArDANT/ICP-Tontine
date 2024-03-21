/**
 * I will start by focusing on 6 functionnalities
 * 1/ Creating a tontine
 * 2/Creating a group of members
 * 3/ Binding the members's group to the tontine
 * 4/ Creating cotisations
 * 5/ Make the members contribute during a contributing period
 * 6/ Sending the collected fund to the corresponding beneficiary
 *  */


// Importing necessary modules from the 'azle' library and 'uuid' library
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from "uuid";

/**
 * Creating the differents entities
 * We need entities for : Tontines, Groups, Members, Contributing Periods aka Cotisations, and Payments
 * For that we'll need to create Record objects and StableBTreeMap for each entity
 */


// Record type for a Tontine entity

type Tontine = Record<{
    id: string; // Unique identifier for the tontine
    owner: Principal; // Owner of the tontine
    name: string; // Name of the tontine
    amount_to_contribute: number; // Amount to be contributed
    days_to_contribute: number; // number of days between each contributions
    current_round: number; // round in which the members are contributing
    created_date: nat64; // Date when the tontine was created
    updated_at: Opt<nat64>; // Date when the tontine was last updated (optional)
}>;

// Record type for a Group entity
type Group = Record<{
    id: string; // Unique identifier for the group
    tontine_id: string; // Identifier of the tontine for which the group is created
    created_date: nat64; // Date when the group was created
    updated_at: Opt<nat64>; // Date when the group was last updated (optional)
}>;

// Record type for a Member entity
type Member = Record<{
    id: string; // Unique identifier for the member
    name: string; // name of the member
    email: string; // email of the member
    balance: number; // balance of the member
    created_date: nat64; // Date when the member was created
    updated_at: Opt<nat64>; // Date when the member was last updated (optional)
}>;

// Record type for an entity binding a member to a group by his order to benefit
type MemberGroup = Record<{
    id: string; // Unique identifier for the bond
    member_id: string; // Identifier of the member
    group_id: string; // Identifier of the group
    order_to_benefit: number; // For example : 1 if the member will be the first to benefit
    created_date: nat64; // Date when the member was bond to the group
    updated_at: Opt<nat64>; // (optional)
}>;

// Record type for a Cotisation entity
type Cotisation = Record<{
    id: string; // Unique identifier of the cotisation
    tontine_id: string; // Identifier of the tontine in which the cotisation is taking place
    total_contributed: number; // total amount of the payments made by the members
    cotisation_round: number; // round in which the members are contributing
    created_date: nat64; // Date when the cotisation was created
    updated_at: Opt<nat64>; // Date when the cotisation was last updated (optional)
}>;

// Record type for the Payment entity
type Payment = Record<{
    id: string; // Unique identifier of the payment
    member_id: string; // Identifier of the member making the payment
    cotisation_id: string; // Identifier of the cotisation for which the payment is made
    payment_amount: number; // amount the member is paying
}>;

// Record payload for the tontine entity
type TontinePayload = Record<{
    name: string; // Name of the tontine
    amount_to_contribute: number; // Amount to be contributed
    days_to_contribute: number; // number of days between each contributions
}>;

//Record payload for the member entity
type MemberPayload = Record<{
    name: string; // name of the member
    email: string; // email of the member
    balance: number; // balance of the member
}>;

// Record payload for the Payment entity
type PaymentPayload = Record<{
    member_id: string; // Identifier of the member making the payment
    cotisation_id: string; // Identifier of the cotisation for which the payment is made
    payment_amount: number; // amount the member is paying
}>;

// Record payload for the entity binding a member to a group by his order to benefit
type MemberGroupPayload = Record<{
    member_id: string; // Identifier of the member
    group_id: string; // Identifier of the group
    order_to_benefit: number; // For example : 1 if the member will be the first to benefit
}>;


/**
 * Creating the arrays that will contain our datas
 */

const tontineStorage = new StableBTreeMap<string, Tontine>(0, 44, 512);
const groupStorage = new StableBTreeMap<string, Group>(1, 44, 512);
const memberStorage = new StableBTreeMap<string, Member>(2, 44, 512);
const cotisationStorage = new StableBTreeMap<string, Cotisation>(3, 44, 512);
const paymentStorage = new StableBTreeMap<string, Payment>(4, 44, 512);

// Array to add members to a group
const memberGroupStorage = new StableBTreeMap<string, MemberGroup>(5, 44, 512);


// Constants we'll use to add time management to our tontine
const NANOS_PER_SECOND = 1_000_000_000n;
const SECONDS_PER_MINUTE = 60n;
const MINUTES_PER_HOUR = 60n;
const HOURS_PER_DAY = 24n;
const NANOS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * NANOS_PER_SECOND;
const NANOS_PER_MINUTE = NANOS_PER_SECOND * SECONDS_PER_MINUTE;
const NANOS_PER_HOUR = NANOS_PER_MINUTE * MINUTES_PER_HOUR;

/**
 * Functions to get datas
 */

//Function to get a tontine given his id
$query;
export function getTontine(id: string): Tontine {
    const tontine = tontineStorage.get(id);
    return match(tontine, {
        Some: (t) => t,
        None: () => ({} as unknown as Tontine),
    });
}

//Function to get a tontine knowing the cotisation ID

function getTontineByCotisationId(cotisation_id: string): Tontine | undefined {
    const cotisation = getCotisation(cotisation_id);
    if (cotisation) {
        const tontine = getTontine(cotisation.tontine_id);
        return tontine;
    }
}
// Function to get a cotisation given his id
$query;
export function getCotisation(id: string): Cotisation {
    const cotisation = cotisationStorage.get(id);
    return match(cotisation, {
        Some: (c) => c,
        None: () => ({} as unknown as Cotisation),
    });
}

// Function to get a member given his id
$query;
export function getMember(id: string): Member {
    const member = memberStorage.get(id);
    return match(member, {
        Some: (m) => m,
        None: () => ({} as unknown as Member),
    });
}

// Function to get the current cotisation knowing the tontine ID
$query;
export function getCurrentCotisation(tontine_id: string): Cotisation {
    const tontine = getTontine(tontine_id);
    if (!tontine) {
        throw new Error('Tontine with ID ${id} not found');
    }

    const cotisations = cotisationStorage.values().filter((cotisation) => cotisation.tontine_id === tontine.id && cotisation.cotisation_round === tontine.current_round);
    if (cotisations.length !== 1) {
        throw new Error('Expected exactly one cotisation for the tontine');
    }
    return cotisations[0];
}

// Function to get the total amount a member has contributed
$query;
export function getMemberTotalPayments(member_id: string, tontine_id: string): number {
    const cotisation = getCurrentCotisation(tontine_id);
    if (!cotisation) {
        throw new Error("Any cotisations exists for this tontine");
    }
    const payments = paymentStorage.values().filter((payment) => payment.member_id === member_id && payment.cotisation_id === cotisation.id);
    if (payments.length == 0) {
        return 0;
    }
    else {
        const totalPayments = payments.reduce((acc, payment) => acc + payment.payment_amount, 0);
        return totalPayments;
    }
}

/**
 * Functions to create or update datas
 */

// Function to create a new tontine
$update;
export function addTontine(payload: TontinePayload): Vec<string> {
    const tontine = {
        id: uuidv4(),
        owner: ic.caller(),
        name: payload.name,
        amount_to_contribute: payload.amount_to_contribute,
        days_to_contribute: payload.days_to_contribute,
        current_round: 0,
        created_date: ic.time(),
        updated_at: Opt.None,
    };

    // Automatically create a group after a tontine creation
    const group = {
        id: uuidv4(),
        tontine_id: tontine.id,
        created_date: ic.time(),
        updated_at: Opt.None,
    };

    groupStorage.insert(group.id, group);
    tontineStorage.insert(tontine.id, tontine);

    return [tontine.id, group.id];
}

// Function to create a new member
$update;
export function addMember(payload: MemberPayload): string {
    const member = {
        id: uuidv4(),
        name: payload.name,
        email: payload.email,
        balance: payload.balance,
        created_date: ic.time(),
        updated_at: Opt.None,
    };

    memberStorage.insert(member.id, member);
    return member.id;
}

// Function to add a member to a group
$update;
export function addMemberToGroup(payload: MemberGroupPayload): string {
    const memberGroup = {
        id: uuidv4(),
        member_id: payload.member_id,
        group_id: payload.group_id,
        order_to_benefit: payload.order_to_benefit,
        created_date: ic.time(),
        updated_at: Opt.None,
    };

    //The order to benefit should be unique per member and less than the number of members in the group

    memberGroupStorage.insert(memberGroup.id, memberGroup);
    return memberGroup.id;
}

// Function to create a cotisation
$update;
export function addCotisation(tontine_id: string): string {

    //updating the current round of the tontine
    const tontine = getTontine(tontine_id);
    if (tontine) {
        tontine.current_round = tontine.current_round + 1;
        tontineStorage.insert(tontine.id, tontine);

        const cotisation = {
            id: uuidv4(),
            tontine_id: tontine_id,
            total_contributed: 0,
            cotisation_round: tontine.current_round,
            created_date: ic.time(),
            updated_at: Opt.None,
        };

        cotisationStorage.insert(cotisation.id, cotisation);

        return cotisation.id;
    }
    else return "";

}


// Function to make a payment by a member for a specific cotisation
$update;
export function contribute(payload: PaymentPayload): void {
    const payment = {
        id: uuidv4(),
        member_id: payload.member_id,
        cotisation_id: payload.cotisation_id,
        payment_amount: payload.payment_amount,
        created_date: ic.time(),
        updated_at: Opt.None,
    };

    const cotisation = getCotisation(payload.cotisation_id);

    if (cotisation) {
        const member = getMember(payload.member_id);
        const tontine = getTontineByCotisationId(payload.cotisation_id);
        if (tontine) {
            if (member) {
                if (member.balance >= payload.payment_amount) {
                    const member_total_payments = getMemberTotalPayments(payload.member_id, tontine.id);
                    if (member_total_payments + payload.payment_amount <= tontine.amount_to_contribute) {

                        //making the payment
                        paymentStorage.insert(payment.id, payment);

                        //updating the member balance
                        member.balance -= payload.payment_amount;
                        memberStorage.insert(payload.member_id, member);

                        //updating the cotisation balance
                        cotisation.total_contributed += payload.payment_amount;
                        cotisationStorage.insert(payload.cotisation_id, cotisation);
                    }
                    else {
                        const amount_remaining = tontine.amount_to_contribute - member_total_payments;
                        throw new Error('You only need to contribute ' + amount_remaining);
                    }
                }
                else throw new Error("The balance of the member is insufficient to pay this amount")
            }
            else throw new Error("The member doesn't exist");
        }
        else throw new Error("The tontine doesn't exist");
    }
    else throw new Error("The cotisation doesn't exist");

}

// Function to send the money to the beneficiary
$update;
export function releaseMoneyToBeneficiary(tontine_id: string): number {
    const tontine = getTontine(tontine_id);
    if (!tontine) {
        throw new Error('Tontine not found');
    }

    const groups = groupStorage.values().filter((group) => group.tontine_id === tontine.id);
    if (groups.length !== 1) {
        throw new Error('Expected exactly one group for the tontine');
    }

    const memberGroups = memberGroupStorage.values().filter((memberGroup) => memberGroup.group_id === groups[0].id && memberGroup.order_to_benefit === tontine.current_round);
    if (memberGroups.length !== 1) {
        throw new Error('Expected exactly one member group for the tontine');
    }

    const cotisations = cotisationStorage.values().filter((cotisation) => cotisation.tontine_id === tontine.id && cotisation.cotisation_round === tontine.current_round);
    if (cotisations.length !== 1) {
        throw new Error('Expected exactly one cotisation for the tontine');
    }

    const members = memberStorage.values().filter((member) => member.id === memberGroups[0].member_id);

    if (members.length !== 1) {
        throw new Error('Expected exactly one member as beneficiary');
    }

    members[0].balance += cotisations[0].total_contributed;
    memberStorage.insert(members[0].id, members[0]);
    cotisations[0].total_contributed = 0;
    cotisationStorage.insert(cotisations[0].id, cotisations[0]);

    return members[0].balance;
}

// Function to get a member balance
$query;
export function getMemberBalance(member_id: string): number {
    const member = match(memberStorage.get(member_id), {
        Some: (member) => member,
        None: () => ({} as unknown as Member),
    });

    if (!member) {
        throw new Error('Member not found');
    }
    else return member.balance;
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

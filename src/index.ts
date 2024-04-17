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
// Importing necessary libraries and dependencies
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from "uuid";

// Record type for a Tontine entity
type Tontine = Record<{
    id: string; // Unique identifier for the tontine
    owner: Principal; // Owner of the tontine
    name: string; // Name of the tontine
    amount_to_contribute: number; // Amount to be contributed
    days_to_contribute: number; // Number of days between each contributions
    current_round: number; // Round in which the members are contributing
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
    name: string; // Name of the member
    email: string; // Email of the member
    balance: number; // Balance of the member
    created_date: nat64; // Date when the member was created
    updated_at: Opt<nat64>; // Date when the member was last updated (optional)
}>;

// Record type for an entity binding a member to a group by their order to benefit
type MemberGroup = Record<{
    id: string; // Unique identifier for the bond
    member_id: string; // Identifier of the member
    group_id: string; // Identifier of the group
    order_to_benefit: number; // For example: 1 if the member will be the first to benefit
    created_date: nat64; // Date when the member was bond to the group
    updated_at: Opt<nat64>; // (optional)
}>;

// Record type for a Cotisation entity
type Cotisation = Record<{
    id: string; // Unique identifier of the cotisation
    tontine_id: string; // Identifier of the tontine in which the cotisation is taking place
    total_contributed: number; // Total amount of the payments made by the members
    cotisation_round: number; // Round in which the members are contributing
    created_date: nat64; // Date when the cotisation was created
    updated_at: Opt<nat64>; // Date when the cotisation was last updated (optional)
}>;

// Record type for the Payment entity
type Payment = Record<{
    id: string; // Unique identifier of the payment
    member_id: string; // Identifier of the member making the payment
    cotisation_id: string; // Identifier of the cotisation for which the payment is made
    payment_amount: number; // Amount the member is paying
}>;

// Record payload for the tontine entity
type TontinePayload = Record<{
    name: string; // Name of the tontine
    amount_to_contribute: number; // Amount to be contributed
    days_to_contribute: number; // Number of days between each contributions
}>;

// Record payload for the member entity
type MemberPayload = Record<{
    name: string; // Name of the member
    email: string; // Email of the member
    balance: number; // Balance of the member
}>;

// Record payload for the Payment entity
type PaymentPayload = Record<{
    member_id: string; // Identifier of the member making the payment
    cotisation_id: string; // Identifier of the cotisation for which the payment is made
    payment_amount: number; // Amount the member is paying
}>;

// Record payload for the entity binding a member to a group by their order to benefit
type MemberGroupPayload = Record<{
    member_id: string; // Identifier of the member
    group_id: string; // Identifier of the group
    order_to_benefit: number; // For example: 1 if the member will be the first to benefit
}>;

// Creating the arrays that will contain our data
const tontineStorage = new StableBTreeMap<string, Tontine>(0, 44, 512);
const groupStorage = new StableBTreeMap<string, Group>(1, 44, 512);
const memberStorage = new StableBTreeMap<string, Member>(2, 44, 512);
const cotisationStorage = new StableBTreeMap<string, Cotisation>(3, 44, 512);
const paymentStorage = new StableBTreeMap<string, Payment>(4, 44, 512);
const memberGroupStorage = new StableBTreeMap<string, MemberGroup>(5, 44, 512);

// Constants for time management
const NANOS_PER_SECOND = 1_000_000_000n;
const SECONDS_PER_MINUTE = 60n;
const MINUTES_PER_HOUR = 60n;
const HOURS_PER_DAY = 24n;
const NANOS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * NANOS_PER_SECOND;
const NANOS_PER_MINUTE = NANOS_PER_SECOND * SECONDS_PER_MINUTE;
const NANOS_PER_HOUR = NANOS_PER_MINUTE * MINUTES_PER_HOUR;

// Function to get a tontine given its ID
$query;
export function getTontine(id: string): Tontine {
    const tontine = tontineStorage.get(id);
    return match(tontine, {
        Some: (t) => t,
        None: () => ({} as Tontine),
    });
}

// Function to get a cotisation given its ID
$query;
export function getCotisation(id: string): Cotisation {
    const cotisation = cotisationStorage.get(id);
    return match(cotisation, {
        Some: (c) => c,
        None: () => ({} as Cotisation),
    });
}

// Function to get a member given its ID
$query;
export function getMember(id: string): Member {
    const member = memberStorage.get(id);
    return match(member, {
        Some: (m) => m,
        None: () => ({} as Member),
    });
}

// Function to get the current cotisation given the tontine ID
$query;
export function getCurrentCotisation(tontine_id: string): Cotisation {
    const tontine = getTontine(tontine_id);
    if (!tontine) {
        throw new Error(`Tontine with ID ${tontine_id} not found`);
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
        throw new Error("No cotisations exist for this tontine");
    }
    const payments = paymentStorage.values().filter((payment) => payment.member_id === member_id && payment.cotisation_id === cotisation.id);
    if (payments.length === 0) {
        return 0;
    } else {
        return payments.reduce((acc, payment) => acc + payment.payment_amount, 0);
    }
}

// Function to create a new tontine
$update;
export function addTontine(payload: TontinePayload): Vec<string> {
    const tontine_id = uuidv4();
    const owner = ic.caller();
    const created_date = ic.time();
    const tontine: Tontine = {
        id: tontine_id,
        owner: owner,
        name: payload.name,
        amount_to_contribute: payload.amount_to_contribute,
        days_to_contribute: payload.days_to_contribute,
        current_round: 0,
        created_date: created_date,
        updated_at: Opt.None,
    };

    // Automatically create a group after a tontine creation
    const group_id = uuidv4();
    const group: Group = {
        id: group_id,
        tontine_id: tontine_id,
        created_date: created_date,
        updated_at: Opt.None,
    };

    groupStorage.insert(group_id, group);
    tontineStorage.insert(tontine_id, tontine);

    return Vec.fromArray([tontine_id, group_id]);
}

// Function to create a new member
$update;
export function addMember(payload: MemberPayload): string {
    const member_id = uuidv4();
    const created_date = ic.time();
    const member: Member = {
        id: member_id,
        name: payload.name,
        email: payload.email,
        balance: payload.balance,
        created_date: created_date,
        updated_at: Opt.None,
    };

    memberStorage.insert(member_id, member);
    return member_id;
}

// Function to add a member to a group
$update;
export function addMemberToGroup(payload: MemberGroupPayload): string {
    const memberGroup_id = uuidv4();
    const created_date = ic.time();
    const memberGroup: MemberGroup = {
        id: memberGroup_id,
        member_id: payload.member_id,
        group_id: payload.group_id,
        order_to_benefit: payload.order_to_benefit,
        created_date: created_date,
        updated_at: Opt.None,
    };

    // The order to benefit should be unique per member and less than the number of members in the group
    memberGroupStorage.insert(memberGroup_id, memberGroup);
    return memberGroup_id;
}

// Function to create a cotisation
$update;
export function addCotisation(tontine_id: string): string {
    const tontine = getTontine(tontine_id);
    if (!tontine) {
        throw new Error('Tontine not found');
    }

    const cotisation_id = uuidv4();
    const created_date = ic.time();
    const cotisation: Cotisation = {
        id: cotisation_id,
        tontine_id: tontine_id,
        total_contributed: 0,
        cotisation_round: tontine.current_round,
        created_date: created_date,
        updated_at: Opt.None,
    };

    // Updating the current round of the tontine
    tontine.current_round += 1;
    tontineStorage.insert(tontine_id, tontine);

    cotisationStorage.insert(cotisation_id, cotisation);

    return cotisation_id;
}

// Function to make a payment by a member for a specific cotisation
$update;
export function contribute(payload: PaymentPayload): void {
    const cotisation = getCurrentCotisation(payload.cotisation_id);
    if (!cotisation) {
        throw new Error('Cotisation not found');
    }

    const member = getMember(payload.member_id);
    if (!member) {
        throw new Error('Member not found');
    }

    const total_payments = getMemberTotalPayments(payload.member_id, cotisation.tontine_id);
    if (total_payments + payload.payment_amount > cotisation.total_contributed) {
        throw new Error('Payment amount exceeds the remaining contribution needed');
    }

    if (member.balance < payload.payment_amount) {
        throw new Error('Insufficient balance to make the payment');
    }

    const payment_id = uuidv4();
    const created_date = ic.time();
    const payment: Payment = {
        id: payment_id,
        member_id: payload.member_id,
        cotisation_id: payload.cotisation_id,
        payment_amount: payload.payment_amount,
        created_date: created_date,
        updated_at: Opt.None,
    };

    // Update member balance
    member.balance -= payload.payment_amount;
    memberStorage.insert(payload.member_id, member);

    // Update cotisation total contributed
    cotisation.total_contributed += payload.payment_amount;
    cotisationStorage.insert(cotisation.id, cotisation);

    paymentStorage.insert(payment_id, payment);
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

    const beneficiary_id = memberGroups[0].member_id;
    const beneficiary = getMember(beneficiary_id);
    if (!beneficiary) {
        throw new Error('Beneficiary member not found');
    }

    beneficiary.balance += cotisations[0].total_contributed;
    memberStorage.insert(beneficiary_id, beneficiary);

    cotisations[0].total_contributed = 0;
    cotisationStorage.insert(cotisations[0].id, cotisations[0]);

    return beneficiary.balance;
}

// Function to get a member balance
$query;
export function getMemberBalance(member_id: string): number {
    const member = match(memberStorage.get(member_id), {
        Some: (member) => member,
        None: () => ({} as Member),
    });

    if (!member) {
        throw new Error('Member not found');
    }
    return member.balance;
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


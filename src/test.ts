import nu_summary from "./index";
console.log('testing',__filename);

const summary_data_store = {loaded:false};

const summary = async () => {
    const loaded_summary = await nu_summary('./', null, './records/a/record.json');
    Object.assign(summary_data_store, loaded_summary);
    summary_data_store.loaded = true;
}

summary();

console.log(summary_data_store.loaded);



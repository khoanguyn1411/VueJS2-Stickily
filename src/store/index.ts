import { TaskStatus, Todo } from "@/types";
import { TodoStorage } from "@/utils";
import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";

Vue.use(Vuex);

interface State {
  status: TaskStatus;
  todoList: readonly Todo[];
  todoListFiltered: readonly Todo[];
}

const todoStorage = TodoStorage();
const filterListByStatus = (state: State, status: TaskStatus): void => {
  if (status === TaskStatus.All) {
    state.todoListFiltered = state.todoList;
    return;
  }
  state.todoListFiltered = state.todoList.filter(
    (item) => item.status === status
  );
};

const store: StoreOptions<State> = {
  state: {
    status: TaskStatus.All,
    todoList: todoStorage.getList() ?? [],
    todoListFiltered: todoStorage.getList() ?? [],
  },
  getters: {
    status: (state) => state.status,
    todoList: (state) => state.todoList,
    todoListFiltered: (state) => state.todoListFiltered,
  },
  mutations: {
    addNewTodo(state, payload: Todo) {
      state.todoList = [...state.todoList, payload];
      state.todoListFiltered = [...state.todoListFiltered, payload];
    },
    changeTaskStatusTo(
      state,
      { status, task }: { status: Omit<TaskStatus, TaskStatus.All>; task: Todo }
    ) {
      state.todoList = state.todoList.map((item) => {
        if (item.id === task.id) {
          return { ...item, status };
        }
        return item;
      });
      filterListByStatus(state, state.status);
    },
    changeStatusTo(state, status: TaskStatus) {
      state.status = status;
      filterListByStatus(state, status);
    },
  },
  actions: {
    addNewTodo({ commit, state }, payload: readonly Todo[]) {
      commit("addNewTodo", payload);
      todoStorage.setList(state.todoList);
    },
    changeStatusTo({ commit }, payload: TaskStatus) {
      commit("changeStatusTo", payload);
    },
    changeTaskStatusTo(
      { commit, state },
      payload: Omit<TaskStatus, TaskStatus.All>
    ) {
      commit("changeTaskStatusTo", payload);
      todoStorage.setList(state.todoList);
    },
  },
  modules: {},
};

export default new Vuex.Store<State>(store);
